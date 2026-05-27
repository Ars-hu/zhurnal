<?php
class AssignmentController {
    private PDO $db;
    private array $user;

    public function __construct(PDO $db, array $user) {
        $this->db   = $db;
        $this->user = $user;
    }

    // GET /api/assignments
    // Админ видит все, преподаватель — только свои
    public function index(): void {
        if ($this->user['role'] === 'admin') {
            $stmt = $this->db->query('
                SELECT tsg.id, tsg.teacher_id, tsg.subject_id, tsg.group_id,
                       u.name AS teacher_name,
                       s.name AS subject_name,
                       g.name AS group_name
                FROM teacher_subject_group tsg
                JOIN teachers t ON tsg.teacher_id = t.id
                JOIN users    u ON t.user_id       = u.id
                JOIN subjects s ON tsg.subject_id  = s.id
                JOIN groups   g ON tsg.group_id    = g.id
                ORDER BY u.name, s.name
            ');
        } else {
            // Преподаватель видит только свои назначения
            $stmt = $this->db->prepare('
                SELECT tsg.id, tsg.teacher_id, tsg.subject_id, tsg.group_id,
                       s.name AS subject_name,
                       g.name AS group_name
                FROM teacher_subject_group tsg
                JOIN teachers t ON tsg.teacher_id = t.id
                JOIN subjects s ON tsg.subject_id  = s.id
                JOIN groups   g ON tsg.group_id    = g.id
                WHERE t.user_id = ?
                ORDER BY s.name
            ');
            $stmt->execute([$this->user['id']]);
        }
        echo json_encode($stmt->fetchAll());
    }

    // POST /api/assignments  { teacher_id, subject_id, group_id }
    public function store(array $body): void {
        if ($this->user['role'] !== 'admin') {
            http_response_code(403); echo json_encode(['error' => 'Доступ запрещён']); return;
        }

        $teacher_id = $body['teacher_id'] ?? null;
        $subject_id = $body['subject_id'] ?? null;
        $group_id   = $body['group_id']   ?? null;

        if (!$teacher_id || !$subject_id || !$group_id) {
            http_response_code(400); echo json_encode(['error' => 'Все поля обязательны']); return;
        }

        // Проверяем на дубликат
        $check = $this->db->prepare('SELECT id FROM teacher_subject_group WHERE teacher_id=? AND subject_id=? AND group_id=?');
        $check->execute([$teacher_id, $subject_id, $group_id]);
        if ($check->fetch()) {
            http_response_code(409); echo json_encode(['error' => 'Такое назначение уже существует']); return;
        }

        $stmt = $this->db->prepare('INSERT INTO teacher_subject_group (teacher_id, subject_id, group_id) VALUES (?, ?, ?)');
        $stmt->execute([$teacher_id, $subject_id, $group_id]);
        http_response_code(201);
        echo json_encode(['id' => $this->db->lastInsertId(), 'message' => 'Назначение создано']);
    }

    // DELETE /api/assignments/{id}
    public function destroy(int $id): void {
        if ($this->user['role'] !== 'admin') {
            http_response_code(403); echo json_encode(['error' => 'Доступ запрещён']); return;
        }
        $this->db->prepare('DELETE FROM teacher_subject_group WHERE id = ?')->execute([$id]);
        echo json_encode(['message' => 'Назначение удалено']);
    }
}
