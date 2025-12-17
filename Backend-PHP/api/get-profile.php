<?php
include 'config.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$userId = $_GET['userId'] ?? 0;

if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'User ID required']);
    exit();
}

// Get user info
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");
$stmt->execute([':id' => $userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit();
}

// Get profile info
$stmt = $pdo->prepare("SELECT * FROM profiles WHERE user_id = :user_id");
$stmt->execute([':user_id' => $userId]);
$profile = $stmt->fetch(PDO::FETCH_ASSOC);

// Get role-specific profile
$roleTable = '';
switch ($user['role']) {
    case 'candidate': $roleTable = 'candidate_profiles'; break;
    case 'recruiter': $roleTable = 'recruiter_profiles'; break;
    case 'admin': $roleTable = 'admin_profiles'; break;
}

$roleProfile = [];
if ($roleTable) {
    $stmt = $pdo->prepare("SELECT * FROM $roleTable WHERE user_id = :user_id");
    $stmt->execute([':user_id' => $userId]);
    $roleProfile = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
}

echo json_encode([
    'success' => true,
    'profile' => array_merge(
        $profile ?: [],
        $roleProfile,
        ['role' => $user['role']]
    )
]);
?>
