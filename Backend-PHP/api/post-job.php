<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require "config.php"; // this gives $pdo

$input = json_decode(file_get_contents("php://input"), true);

if (
    !$input ||
    empty($input['title']) ||
    empty($input['description']) ||
    empty($input['recruiter_id'])
) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields"
    ]);
    exit();
}

$title = trim($input['title']);
$description = trim($input['description']);
$recruiterId = (int)$input['recruiter_id'];

try {
    $stmt = $pdo->prepare("
        INSERT INTO jobs (title, description, recruiter_id)
        VALUES (:title, :description, :recruiter_id)
    ");

    $stmt->execute([
        ":title" => $title,
        ":description" => $description,
        ":recruiter_id" => $recruiterId
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Job posted successfully"
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
