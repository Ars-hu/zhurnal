<?php
require_once 'config/database.php';

$db = (new Database())->connect();
$stmt = $db->prepare('SELECT * FROM users WHERE email = ?');
$stmt->execute(['admin@college.ru']);
$user = $stmt->fetch();

echo 'Найден: ' . ($user ? 'ДА' : 'НЕТ') . '<br>';
echo 'Пароль ОК: ' . (password_verify('password123', $user['password']) ? 'ДА' : 'НЕТ') . '<br>';
echo 'Хэш в БД: ' . $user['password'];