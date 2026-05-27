<?php
class AuthController {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function login(array $body): void {
        $email    = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';

        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Email и пароль обязательны']);
            return;
        }

        $stmt = $this->db->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Неверный email или пароль']);
            return;
        }

        $token = JWT::encode([
            'id'   => $user['id'],
            'role' => $user['role'],
            'name' => $user['name'],
        ]);

        echo json_encode([
            'token' => $token,
            'user'  => [
                'id'   => $user['id'],
                'name' => $user['name'],
                'role' => $user['role'],
            ]
        ]);
    }

    public function me(): void {
        $user = JWT::getFromRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        echo json_encode($user);
    }
}
