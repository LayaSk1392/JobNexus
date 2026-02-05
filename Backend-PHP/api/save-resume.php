<?php

error_reporting(E_ALL);
ini_set('display_errors', 1); 
ini_set('log_errors', 1);
ini_set('error_log', '../php_errors.log');

// Set headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only handle POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Use POST.'
    ]);
    exit();
}

try {
    // Get JSON input
    $input = file_get_contents('php://input');
    
    if (empty($input)) {
        throw new Exception('No data received');
    }
    
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data: ' . json_last_error_msg());
    }
    
    // Validate required fields
    if (!isset($data['user_id'])) {
        throw new Exception('Missing required field: user_id');
    }
    
    if (!isset($data['resume_data'])) {
        throw new Exception('Missing required field: resume_data');
    }
    
    if (!isset($data['template_id'])) {
        throw new Exception('Missing required field: template_id');
    }
    
    // Database connection using Database class
    require_once __DIR__ . '/../config/database.php';
    $database = new Database();
    $conn = $database->getConnection();
    
    if (!$conn) {
        throw new Exception('Database connection failed');
    }
    
    // Check if resume already exists for this user
    $checkSql = "SELECT id FROM resumes WHERE user_id = :user_id";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bindParam(':user_id', $data['user_id'], PDO::PARAM_INT);
    $checkStmt->execute();
    
    $resumeData = json_encode($data['resume_data']);
    
    if ($checkStmt->rowCount() > 0) {
        // Update existing resume
        $sql = "UPDATE resumes 
                SET resume_data = :resume_data, 
                    template_id = :template_id,
                    updated_at = NOW()
                WHERE user_id = :user_id";
        
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':user_id', $data['user_id'], PDO::PARAM_INT);
        $stmt->bindParam(':resume_data', $resumeData, PDO::PARAM_STR);
        $stmt->bindParam(':template_id', $data['template_id'], PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            $resumeId = $checkStmt->fetch(PDO::FETCH_ASSOC)['id'];
            $response = [
                'success' => true,
                'message' => 'Resume updated successfully',
                'resume_id' => $resumeId
            ];
        } else {
            throw new Exception('Failed to update resume');
        }
    } else {
        // Insert new resume
        $sql = "INSERT INTO resumes (user_id, resume_data, template_id, created_at, updated_at) 
                VALUES (:user_id, :resume_data, :template_id, NOW(), NOW())";
        
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':user_id', $data['user_id'], PDO::PARAM_INT);
        $stmt->bindParam(':resume_data', $resumeData, PDO::PARAM_STR);
        $stmt->bindParam(':template_id', $data['template_id'], PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            $response = [
                'success' => true,
                'message' => 'Resume saved successfully',
                'resume_id' => $conn->lastInsertId()
            ];
        } else {
            throw new Exception('Failed to save resume');
        }
    }
    
    http_response_code(200);
    
} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
    http_response_code(500);
    
    // Log the error
    error_log("Resume save error: " . $e->getMessage());
}

echo json_encode($response);
?>