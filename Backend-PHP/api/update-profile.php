<?php
include 'config.php';
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$userId = $input['userId'] ?? 0;

if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'User ID required']);
    exit();
}
/*
$host = '127.0.0.1';
$dbname = 'job_nexus';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    */
    // Update profile
    $stmt = $pdo->prepare("
        INSERT INTO profiles (user_id, first_name, last_name, phone) 
        VALUES (:user_id, :first_name, :last_name, :phone)
        ON DUPLICATE KEY UPDATE 
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        phone = VALUES(phone)
    ");
    
    $stmt->execute([
        ':user_id' => $userId,
        ':first_name' => $input['firstName'] ?? '',
        ':last_name' => $input['lastName'] ?? '',
        ':phone' => $input['phone'] ?? ''
    ]);
    
    // Update role-specific profile
    // (Add similar logic for candidate_profiles, recruiter_profiles, admin_profiles)
    
    echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
    
/* catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Update failed: ' . $e->getMessage()]);
}*/
?>