<?php
// ═══════════════════════════════════════════════
// Updates an order's status (pending / processing / shipped / delivered / cancelled)
// Called from the admin Orders page.
// ═══════════════════════════════════════════════
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$orderCode = isset($data['orderCode']) ? trim($data['orderCode']) : null;
$status    = isset($data['status']) ? trim($data['status']) : null;

$allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

if (!$orderCode || !$status) {
    http_response_code(400);
    echo json_encode(["error" => "orderCode and status are required"]);
    exit();
}

if (!in_array($status, $allowedStatuses, true)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid status value"]);
    exit();
}

// Confirm the order actually exists first, so a no-op status update
// (setting the same status it already had) isn't mistaken for "not found".
$check = $conn->prepare("SELECT id FROM orders WHERE order_code = ? LIMIT 1");
$check->bind_param("s", $orderCode);
$check->execute();
$orderExists = $check->get_result()->num_rows > 0;
$check->close();

if (!$orderExists) {
    http_response_code(404);
    echo json_encode(["error" => "Order not found"]);
    exit();
}

$stmt = $conn->prepare("UPDATE orders SET status = ? WHERE order_code = ?");
$stmt->bind_param("ss", $status, $orderCode);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "orderCode" => $orderCode, "status" => $status]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to update order: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
