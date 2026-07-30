<?php
// ═══════════════════════════════════════════════
// Database connection settings
// Default XAMPP values -- change if yours is different
// ═══════════════════════════════════════════════
$host = "localhost";
$user = "root";
$pass = "";          // XAMPP default MySQL password is empty
$dbname = "stepz_db";

$conn = new mysqli($host, $user, $pass, $dbname, 3307);

if ($conn->connect_error) {
    http_response_code(500);
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

$conn->set_charset("utf8mb4");
?>
