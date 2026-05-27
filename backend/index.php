<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/JWT.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/StudentController.php';
require_once __DIR__ . '/controllers/TeacherController.php';
require_once __DIR__ . '/controllers/GroupSubjectController.php';
require_once __DIR__ . '/controllers/GradeAttendanceController.php';
require_once __DIR__ . '/controllers/AssignmentController.php';

$db     = (new Database())->connect();
$method = $_SERVER['REQUEST_METHOD'];
$uri    = $_GET['route'] ?? '';
$parts    = explode('/', trim($uri, '/'));
$resource = $parts[0] ?? '';
$id       = isset($parts[1]) && is_numeric($parts[1]) ? (int)$parts[1] : null;
$sub      = $parts[1] ?? null;  // может быть 'me' или числом
$body     = json_decode(file_get_contents('php://input'), true) ?? [];

// Публичные маршруты
if ($resource === 'auth') {
    $ctrl = new AuthController($db);
    if ($method === 'POST' && ($parts[1] ?? '') === 'login') {
        $ctrl->login($body);
    } elseif ($method === 'GET' && ($parts[1] ?? '') === 'me') {
        $ctrl->me();
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
    }
    exit;
}

// Проверяем токен
$user = JWT::getFromRequest();
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

switch ($resource) {
    case 'students':
        $ctrl = new StudentController($db, $user);
        if ($method === 'GET' && $sub === 'me') {
            $ctrl->me();
        } else {
            match($method) {
                'GET'    => $id ? $ctrl->show($id) : $ctrl->index(),
                'POST'   => $ctrl->store($body),
                'PUT'    => $ctrl->update($id, $body),
                'DELETE' => $ctrl->destroy($id),
                default  => http_response_code(405)
            };
        }
        break;

    case 'teachers':
        $ctrl = new TeacherController($db, $user);
        match($method) {
            'GET'    => $id ? $ctrl->show($id) : $ctrl->index(),
            'POST'   => $ctrl->store($body),
            'PUT'    => $ctrl->update($id, $body),
            'DELETE' => $ctrl->destroy($id),
            default  => http_response_code(405)
        };
        break;

    case 'groups':
        $ctrl = new GroupController($db, $user);
        match($method) {
            'GET'    => $id ? $ctrl->show($id) : $ctrl->index(),
            'POST'   => $ctrl->store($body),
            'PUT'    => $ctrl->update($id, $body),
            'DELETE' => $ctrl->destroy($id),
            default  => http_response_code(405)
        };
        break;

    case 'subjects':
        $ctrl = new SubjectController($db, $user);
        match($method) {
            'GET'    => $id ? $ctrl->show($id) : $ctrl->index(),
            'POST'   => $ctrl->store($body),
            'PUT'    => $ctrl->update($id, $body),
            'DELETE' => $ctrl->destroy($id),
            default  => http_response_code(405)
        };
        break;

    case 'grades':
        $ctrl = new GradeController($db, $user);
        match($method) {
            'GET'    => $ctrl->index(),
            'POST'   => $ctrl->store($body),
            'PUT'    => $ctrl->update($id, $body),
            'DELETE' => $ctrl->destroy($id),
            default  => http_response_code(405)
        };
        break;

    // Назначения преподавателей на предмет+группу
    case 'assignments':
        $ctrl = new AssignmentController($db, $user);
        match($method) {
            'GET'    => $ctrl->index(),
            'POST'   => $ctrl->store($body),
            'DELETE' => $ctrl->destroy($id),
            default  => http_response_code(405)
        };
        break;

    // Статистика для главной страницы админа
    case 'stats':
        if ($user['role'] !== 'admin') { http_response_code(403); echo json_encode(['error' => 'Forbidden']); break; }
        echo json_encode([
            'students' => (int)$db->query('SELECT COUNT(*) FROM students')->fetchColumn(),
            'teachers' => (int)$db->query('SELECT COUNT(*) FROM teachers')->fetchColumn(),
            'groups'   => (int)$db->query('SELECT COUNT(*) FROM groups')->fetchColumn(),
            'subjects' => (int)$db->query('SELECT COUNT(*) FROM subjects')->fetchColumn(),
        ]);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
}
