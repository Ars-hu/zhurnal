<?php
class GroupController {
    private PDO $db;
    private array $user;

    public function __construct(PDO $db, array $user) {
        $this->db   = $db;
        $this->user = $user;
    }

    private function requireAdmin(): bool {
        if ($this->user['role'] !== 'admin') {
            http_response_code(403); echo json_encode(['error' => 'Доступ запрещён']); return false;
        }
        return true;
    }

    public function index(): void {
        $stmt = $this->db->query('SELECT * FROM groups ORDER BY name');
        echo json_encode($stmt->fetchAll());
    }

    public function show(int $id): void {
        $stmt = $this->db->prepare('SELECT * FROM groups WHERE id = ?');
        $stmt->execute([$id]);
        $group = $stmt->fetch();
        if (!$group) { http_response_code(404); echo json_encode(['error' => 'Не найдена']); return; }
        echo json_encode($group);
    }

    public function store(array $body): void {
        if (!$this->requireAdmin()) return;

        $name      = trim($body['name']      ?? '');
        $specialty = trim($body['specialty'] ?? '');
        $year      = (int)($body['year']     ?? 0);

        if (!$name || !$specialty || !$year) {
            http_response_code(400); echo json_encode(['error' => 'Поля name, specialty, year обязательны']); return;
        }

        $stmt = $this->db->prepare('INSERT INTO groups (name, specialty, year) VALUES (?, ?, ?)');
        $stmt->execute([$name, $specialty, $year]);
        http_response_code(201);
        echo json_encode(['id' => $this->db->lastInsertId(), 'message' => 'Группа создана']);
    }

    public function update(int $id, array $body): void {
        if (!$this->requireAdmin()) return;

        $fields = []; $params = [];
        if (!empty($body['name']))      { $fields[] = 'name = ?';      $params[] = $body['name']; }
        if (!empty($body['specialty'])) { $fields[] = 'specialty = ?'; $params[] = $body['specialty']; }
        if (!empty($body['year']))      { $fields[] = 'year = ?';      $params[] = $body['year']; }

        if (!$fields) { http_response_code(400); echo json_encode(['error' => 'Нет данных']); return; }

        $params[] = $id;
        $this->db->prepare('UPDATE groups SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
        echo json_encode(['message' => 'Группа обновлена']);
    }

    public function destroy(int $id): void {
        if (!$this->requireAdmin()) return;
        $this->db->prepare('DELETE FROM groups WHERE id = ?')->execute([$id]);
        echo json_encode(['message' => 'Группа удалена']);
    }
}


class SubjectController {
    private PDO $db;
    private array $user;

    public function __construct(PDO $db, array $user) {
        $this->db   = $db;
        $this->user = $user;
    }

    private function requireAdmin(): bool {
        if ($this->user['role'] !== 'admin') {
            http_response_code(403); echo json_encode(['error' => 'Доступ запрещён']); return false;
        }
        return true;
    }

    public function index(): void {
        $stmt = $this->db->query('SELECT * FROM subjects ORDER BY name');
        echo json_encode($stmt->fetchAll());
    }

    public function show(int $id): void {
        $stmt = $this->db->prepare('SELECT * FROM subjects WHERE id = ?');
        $stmt->execute([$id]);
        $subject = $stmt->fetch();
        if (!$subject) { http_response_code(404); echo json_encode(['error' => 'Не найден']); return; }
        echo json_encode($subject);
    }

    public function store(array $body): void {
        if (!$this->requireAdmin()) return;

        $name = trim($body['name'] ?? '');
        if (!$name) { http_response_code(400); echo json_encode(['error' => 'Поле name обязательно']); return; }

        $stmt = $this->db->prepare('INSERT INTO subjects (name, description, hours) VALUES (?, ?, ?)');
        $stmt->execute([$name, $body['description'] ?? '', (int)($body['hours'] ?? 0)]);
        http_response_code(201);
        echo json_encode(['id' => $this->db->lastInsertId(), 'message' => 'Предмет создан']);
    }

    public function update(int $id, array $body): void {
        if (!$this->requireAdmin()) return;

        $fields = []; $params = [];
        if (!empty($body['name']))        { $fields[] = 'name = ?';        $params[] = $body['name']; }
        if (isset($body['description']))  { $fields[] = 'description = ?'; $params[] = $body['description']; }
        if (!empty($body['hours']))       { $fields[] = 'hours = ?';       $params[] = $body['hours']; }

        if (!$fields) { http_response_code(400); echo json_encode(['error' => 'Нет данных']); return; }

        $params[] = $id;
        $this->db->prepare('UPDATE subjects SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
        echo json_encode(['message' => 'Предмет обновлён']);
    }

    public function destroy(int $id): void {
        if (!$this->requireAdmin()) return;
        $this->db->prepare('DELETE FROM subjects WHERE id = ?')->execute([$id]);
        echo json_encode(['message' => 'Предмет удалён']);
    }
}
