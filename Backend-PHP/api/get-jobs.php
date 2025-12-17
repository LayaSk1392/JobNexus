<?php
include 'config.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json");

$stmt = $pdo->query("
  SELECT 
    jobs.id,
    jobs.title,
    jobs.description,
    jobs.created_at,
    users.email AS recruiter_email
  FROM jobs
  JOIN users ON jobs.recruiter_id = users.id
  ORDER BY jobs.created_at DESC
");

$jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
  'success' => true,
  'jobs' => $jobs
]);
