<?php
class StudentController {
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
        $sql = '
            SELECT s.id, u.name, u.email, g.name AS group_name, g.id AS group_id
            FROM students s
            JOIN users  u ON s.user_id  = u.id
            JOIN groups g ON s.group_id = g.id
        ';
        $params = [];

        if (isset($_GET['group_id'])) {
            $sql .= ' WHERE s.group_id = ?';
            $params[] = $_GET['group_id'];
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll());
    }

    public function show(int $id): void {
        // Студент может смотреть только себя
        if ($this->user['role'] === 'student') {
            $stmt = $this->db->prepare('SELECT id FROM students WHERE user_id = ?');
            $stmt->execute([$this->user['id']]);
            $self = $stmt->fetch();
            if (!$self || $self['id'] !== $id) {
                http_response_code(403); echo json_encode(['error' => 'Доступ запрещён']); return;
            }
        }

        $stmt = $this->db->prepare('
            SELECT s.id, u.name, u.email, g.name AS group_name, g.id AS group_id
            FROM students s
            JOIN users  u ON s.user_id  = u.id
            JOIN groups g ON s.group_id = g.id
            WHERE s.id = ?
        ');
        $stmt->execute([$id]);
        $student = $stmt->fetch();

        if (!$student) {
            http_response_code(404);
            echo json_encode(['error' => 'Студент не найден']);
            return;
        }
        echo json_encode($student);
    }

    // GET /api/students/me — профиль текущего студента
    public function me(): void {
        $stmt = $this->db->prepare('
            SELECT s.id, u.name, u.email, g.name AS group_name, g.id AS group_id
            FROM students s
            JOIN users  u ON s.user_id  = u.id
            JOIN groups g ON s.group_id = g.id
            WHERE s.user_id = ?
        ');
        $stmt->execute([$this->user['id']]);
        $student = $stmt->fetch();
        if (!$student) { http_response_code(404); echo json_encode(['error' => 'Не найден']); return; }
        echo json_encode($student);
    }

    public function store(array $body): void {
        if (!$this->requireAdmin()) return;

        $name     = trim($body['name']     ?? '');
        $email    = trim($body['email']    ?? '');
        $password = $body['password']      ?? 'password123';
        $group_id = $body['group_id']      ?? null;

        if (!$name || !$email || !$group_id) {
            http_response_code(400);
            echo json_encode(['error' => 'Поля name, email, group_id обязательны']);
            return;
        }

        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "student")'
            );
            $stmt->execute([$name, $email, password_hash($password, PASSWORD_BCRYPT)]);
            $userId = $this->db->lastInsertId();

            $stmt = $this->db->prepare('INSERT INTO students (user_id, group_id) VALUES (?, ?)');
            $stmt->execute([$userId, $group_id]);
            $studentId = $this->db->lastInsertId();

            $this->db->commit();

            http_response_code(201);
            echo json_encode(['id' => $studentId, 'message' => 'Студент создан']);
        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update(int $id, array $body): void {
        if (!$this->requireAdmin()) return;

        $stmt = $this->db->prepare('SELECT user_id FROM students WHERE id = ?');
        $stmt->execute([$id]);
        $student = $stmt->fetch();

        if (!$student) {
            http_response_code(404);
            echo json_encode(['error' => 'Студент не найден']);
            return;
        }

        $userFields = []; $userParams = [];
        if (!empty($body['name']))  { $userFields[] = 'name = ?';  $userParams[] = $body['name']; }
        if (!empty($body['email'])) { $userFields[] = 'email = ?'; $userParams[] = $body['email']; }
        // Смена пароля — только если передан
        if (!empty($body['password'])) {
            $userFields[] = 'password = ?';
            $userParams[] = password_hash($body['password'], PASSWORD_BCRYPT);
        }

        if ($userFields) {
            $userParams[] = $student['user_id'];
            $this->db->prepare('UPDATE users SET ' . implode(', ', $userFields) . ' WHERE id = ?')
                     ->execute($userParams);
        }

        if (!empty($body['group_id'])) {
            $this->db->prepare('UPDATE students SET group_id = ? WHERE id = ?')
                     ->execute([$body['group_id'], $id]);
        }

        echo json_encode(['message' => 'Студент обновлён']);
    }

    public function destroy(int $id): void {
        if (!$this->requireAdmin()) return;

        $stmt = $this->db->prepare('SELECT user_id FROM students WHERE id = ?');
        $stmt->execute([$id]);
        $student = $stmt->fetch();

        if (!$student) {
            http_response_code(404);
            echo json_encode(['error' => 'Студент не найден']);
            return;
        }

        $this->db->prepare('DELETE FROM users WHERE id = ?')->execute([$student['user_id']]);
        echo json_encode(['message' => 'Студент удалён']);
    }
}
