<?php
class GradeController {
    private PDO $db;
    private array $user;

    public function __construct(PDO $db, array $user) {
        $this->db   = $db;
        $this->user = $user;
    }

    // GET /api/grades?group_id=1&subject_id=1
    public function index(): void {
        $sql = '
            SELECT g.id, g.grade, g.type, g.date, g.attendance_status,
                   u.name AS student_name,
                   s.name AS subject_name,
                   g.student_id, g.subject_id
            FROM grades g
            JOIN students st ON g.student_id = st.id
            JOIN users    u  ON st.user_id   = u.id
            JOIN subjects s  ON g.subject_id = s.id
            WHERE 1=1
        ';
        $params = [];

        if ($this->user['role'] === 'student') {
            $stmt = $this->db->prepare('SELECT id FROM students WHERE user_id = ?');
            $stmt->execute([$this->user['id']]);
            $student = $stmt->fetch();
            if ($student) { $sql .= ' AND g.student_id = ?'; $params[] = $student['id']; }
        } else {
            if (!empty($_GET['group_id']))   { $sql .= ' AND st.group_id = ?';  $params[] = $_GET['group_id']; }
            if (!empty($_GET['student_id'])) { $sql .= ' AND g.student_id = ?'; $params[] = $_GET['student_id']; }
        }

        if (!empty($_GET['subject_id'])) { $sql .= ' AND g.subject_id = ?'; $params[] = $_GET['subject_id']; }

        $sql .= ' ORDER BY g.date ASC';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll());
    }

    // POST — добавить/обновить запись (оценка + посещаемость в одной ячейке)
    public function store(array $body): void {
        if ($this->user['role'] === 'student') {
            http_response_code(403); echo json_encode(['error' => 'Доступ запрещён']); return;
        }

        $student_id        = $body['student_id']        ?? null;
        $subject_id        = $body['subject_id']        ?? null;
        $date              = $body['date']              ?? date('Y-m-d');
        $grade             = $body['grade']             ?? null;           // null = нет оценки
        $attendance_status = $body['attendance_status'] ?? 'present';
        $type              = $body['type']              ?? 'current';

        if (!$student_id || !$subject_id) {
            http_response_code(400); echo json_encode(['error' => 'student_id и subject_id обязательны']); return;
        }

        // Нельзя ставить оценку при обычном пропуске
        if ($attendance_status === 'absent' && $grade !== null) {
            http_response_code(422);
            echo json_encode(['error' => 'Нельзя поставить оценку при неуважительном пропуске']);
            return;
        }

        // Получаем teacher_id по user_id (для преподавателя; для админа — первый доступный)
        $stmt = $this->db->prepare('SELECT id FROM teachers WHERE user_id = ?');
        $stmt->execute([$this->user['id']]);
        $teacher = $stmt->fetch();
        $teacher_id = $teacher ? $teacher['id'] : 1;

        $stmt = $this->db->prepare('
            INSERT INTO grades (student_id, subject_id, teacher_id, grade, attendance_status, type, date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                grade             = VALUES(grade),
                attendance_status = VALUES(attendance_status),
                type              = VALUES(type),
                teacher_id        = VALUES(teacher_id)
        ');
        $stmt->execute([$student_id, $subject_id, $teacher_id, $grade, $attendance_status, $type, $date]);

        $insertedId = $this->db->lastInsertId() ?: null;
        http_response_code(201);
        echo json_encode(['id' => $insertedId, 'message' => 'Запись сохранена']);
    }

    public function update(int $id, array $body): void {
        if ($this->user['role'] === 'student') {
            http_response_code(403); echo json_encode(['error' => 'Доступ запрещён']); return;
        }

        // Получаем текущую запись
        $stmt = $this->db->prepare('SELECT * FROM grades WHERE id = ?');
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) { http_response_code(404); echo json_encode(['error' => 'Запись не найдена']); return; }

        $attendance_status = $body['attendance_status'] ?? $existing['attendance_status'];
        $grade = array_key_exists('grade', $body) ? $body['grade'] : $existing['grade'];

        // Нельзя ставить оценку при обычном пропуске
        if ($attendance_status === 'absent' && $grade !== null) {
            http_response_code(422);
            echo json_encode(['error' => 'Нельзя поставить оценку при неуважительном пропуске']);
            return;
        }

        $fields = []; $params = [];
        if (array_key_exists('grade', $body))             { $fields[] = 'grade = ?';             $params[] = $body['grade']; }
        if (!empty($body['attendance_status']))            { $fields[] = 'attendance_status = ?'; $params[] = $body['attendance_status']; }
        if (!empty($body['type']))                        { $fields[] = 'type = ?';              $params[] = $body['type']; }
        if (!empty($body['date']))                        { $fields[] = 'date = ?';              $params[] = $body['date']; }

        if (!$fields) { http_response_code(400); echo json_encode(['error' => 'Нет данных']); return; }

        $params[] = $id;
        $this->db->prepare('UPDATE grades SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
        echo json_encode(['message' => 'Запись обновлена']);
    }

    public function destroy(int $id): void {
        if ($this->user['role'] === 'student') {
            http_response_code(403); echo json_encode(['error' => 'Доступ запрещён']); return;
        }
        $this->db->prepare('DELETE FROM grades WHERE id = ?')->execute([$id]);
        echo json_encode(['message' => 'Запись удалена']);
    }
}
