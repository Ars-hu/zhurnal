<?php
class Database {
    private $host     = 'localhost';
    private $db_name  = 'college_journal';
    private $username = 'root';
    private $password = '';
    private $conn;

    public function connect(): PDO {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Ошибка подключения к БД: ' . $e->getMessage()]);
            exit;
        }
        return $this->conn;
    }
}
