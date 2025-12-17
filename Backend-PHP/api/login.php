<?php
include 'config.php';

// Error reporting (disable in production)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
    exit();
}

// Read JSON
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON input'
    ]);
    exit();
}

$email = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');
$role = $input['role'] ?? 'candidate';

if (empty($email) || empty($password)) {
    echo json_encode([
        'success' => false,
        'message' => 'Email and password are required'
    ]);
    exit();
}

try {
    // Get user
    $stmt = $pdo->prepare("
        SELECT id, email, password, role
        FROM users
        WHERE email = :email AND role = :role
        LIMIT 1
    ");
    $stmt->execute([
        ':email' => $email,
        ':role' => $role
    ]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        exit();
    }

    // ✅ PASSWORD CHECK (THIS IS THE FIX)
    if (!password_verify($password, $user['password'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid password'
        ]);
        exit();
    }

    // Get common profile
    $stmt = $pdo->prepare("SELECT * FROM profiles WHERE user_id = :id");
    $stmt->execute([':id' => $user['id']]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'profile' => $profile
        ],
        'token' => base64_encode(json_encode([
            'userId' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role']
        ]))
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Login failed',
        'error' => $e->getMessage()
    ]);
}
