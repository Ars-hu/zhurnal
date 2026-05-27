<?php
class JWT {
    private static $secret = 'college_journal_secret_key_2024';

    public static function encode(array $payload): string {
        $header  = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload['exp'] = time() + 86400; // 24 часа
        $payload = base64_encode(json_encode($payload));
        $sig     = base64_encode(hash_hmac('sha256', "$header.$payload", self::$secret, true));
        return "$header.$payload.$sig";
    }

    public static function decode(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        [$header, $payload, $sig] = $parts;
        $expected = base64_encode(hash_hmac('sha256', "$header.$payload", self::$secret, true));
        if (!hash_equals($expected, $sig)) return null;

        $data = json_decode(base64_decode($payload), true);
        if ($data['exp'] < time()) return null;

        return $data;
    }

    public static function getFromRequest(): ?array {
        $headers = getallheaders();
        $auth    = $headers['Authorization'] ?? '';
        if (!str_starts_with($auth, 'Bearer ')) return null;
        return self::decode(substr($auth, 7));
    }
}
