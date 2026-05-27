<?php
class TeacherController {
    private PDO $db;
    private array $user;

    public function __construct(PDO $db, array $user) {
        $this->db   = $db;
        $this->user = $user;
    }

    private function requireAdmin(): bool {
        if ($this->user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещён']);
            return false;
        }
        return true;
    }

    public function index(): void {
        $stmt = $this->db->query('
            SELECT t.id, u.name, u.email, t.department
            FROM teachers t
            JOIN users u ON t.user_id = u.id
        ');
        echo json_encode($stmt->fetchAll());
    }

    public function show(int $id): void {
        $stmt = $this->db->prepare('
            SELECT t.id, u.name, u.email, t.department
            FROM teachers t JOIN users u ON t.user_id = u.id
            WHERE t.id = ?
        ');
        $stmt->execute([$id]);
        $teacher = $stmt->fetch();
        if (!$teacher) { http_response_code(404); echo json_encode(['error' => 'Не найден']); return; }
        echo json_encode($teacher);
    }

    public function store(array $body): void {
        if (!$this->requireAdmin()) return;

        $name       = trim($body['name']       ?? '');
        $email      = trim($body['email']      ?? '');
        $department = trim($body['department'] ?? '');
        $password   = $body['password']        ?? 'password123';

        if (!$name || !$email) {
            http_response_code(400);
            echo json_encode(['error' => 'Поля name и email обязательны']);
            return;
        }

        $this->db->beginTransaction();
        $this->db->prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "teacher")')
                 ->execute([$name, $email, password_hash($password, PASSWORD_BCRYPT)]);
        $userId = $this->db->lastInsertId();
        $this->db->prepare('INSERT INTO teachers (user_id, department) VALUES (?, ?)')
                 ->execute([$userId, $department]);
        $teacherId = $this->db->lastInsertId();
        $this->db->commit();

        http_response_code(201);
        echo json_encode(['id' => $teacherId, 'message' => 'Преподаватель создан']);
    }

    public function update(int $id, array $body): void {
        if (!$this->requireAdmin()) return;

        $stmt = $this->db->prepare('SELECT user_id FROM teachers WHERE id = ?');
        $stmt->execute([$id]);
        $teacher = $stmt->fetch();
        if (!$teacher) { http_response_code(404); echo json_encode(['error' => 'Не найден']); return; }

        $userFields = []; $userParams = [];
        if (!empty($body['name']))     { $userFields[] = 'name = ?';     $userParams[] = $body['name']; }
        if (!empty($body['email']))    { $userFields[] = 'email = ?';    $userParams[] = $body['email']; }
        if (!empty($body['password'])) { $userFields[] = 'password = ?'; $userParams[] = password_hash($body['password'], PASSWORD_BCRYPT); }

        if ($userFields) {
            $userParams[] = $teacher['user_id'];
            $this->db->prepare('UPDATE users SET ' . implode(', ', $userFields) . ' WHERE id = ?')->execute($userParams);
        }

        if (isset($body['department'])) {
            $this->db->prepare('UPDATE teachers SET department = ? WHERE id = ?')->execute([$body['department'], $id]);
        }

        echo json_encode(['message' => 'Преподаватель обновлён']);
    }

    public function destroy(int $id): void {
        if (!$this->requireAdmin()) return;

        $stmt = $this->db->prepare('SELECT user_id FROM teachers WHERE id = ?');
        $stmt->execute([$id]);
        $teacher = $stmt->fetch();
        if (!$teacher) { http_response_code(404); echo json_encode(['error' => 'Не найден']); return; }

        $this->db->prepare('DELETE FROM users WHERE id = ?')->execute([$teacher['user_id']]);
        echo json_encode(['message' => 'Преподаватель удалён']);
    }
}
