<?php
include 'config.php';

// Enable error reporting for development (remove in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ensure POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
    exit();
}

// Read JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON input'
    ]);
    exit();
}

// Extract fields
$email = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');
$role = $input['role'] ?? 'candidate';
$firstName = trim($input['firstName'] ?? '');
$lastName = trim($input['lastName'] ?? '');

// Basic validation
if (empty($email) || empty($password)) {
    echo json_encode([
        'success' => false,
        'message' => 'Email and password are required'
    ]);
    exit();
}

try {
    // Check if user already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);

    if ($stmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'Email already registered'
        ]);
        exit();
    }

    // Start transaction
    $pdo->beginTransaction();

    // Hash password (better security)
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert into users table
    $stmt = $pdo->prepare("
        INSERT INTO users (email, password, role)
        VALUES (:email, :password, :role)
    ");
    $stmt->execute([
        ':email' => $email,
        ':password' => $hashedPassword,
        ':role' => $role
    ]);

    $userId = $pdo->lastInsertId();

    // Insert into profiles table
    $stmt = $pdo->prepare("
        INSERT INTO profiles (user_id, first_name, last_name)
        VALUES (:user_id, :first_name, :last_name)
    ");
    $stmt->execute([
        ':user_id' => $userId,
        ':first_name' => $firstName,
        ':last_name' => $lastName
    ]);

    // Insert role-specific profile
    $roleTable = null;
    switch ($role) {
        case 'candidate': $roleTable = 'candidate_profiles'; break;
        case 'recruiter': $roleTable = 'recruiter_profiles'; break;
        case 'admin': $roleTable = 'admin_profiles'; break;
    }

    if ($roleTable) {
        $stmt = $pdo->prepare("
            INSERT INTO $roleTable (user_id)
            VALUES (:user_id)
        ");
        $stmt->execute([':user_id' => $userId]);
    }

    // Commit transaction
    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Registration successful',
        'userId' => $userId
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();

    echo json_encode([
        'success' => false,
        'message' => 'Registration failed',
        'error' => $e->getMessage()
    ]);
}
