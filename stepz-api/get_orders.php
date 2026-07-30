<?php
// ═══════════════════════════════════════════════
// Returns orders from the database.
// - Used by the ADMIN panel to list every order.
// - Used by the customer "My Orders" views, which pass ?email=... to
//   only get that customer's own orders.
// ═══════════════════════════════════════════════
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';

$email = isset($_GET['email']) ? trim($_GET['email']) : null;

if ($email) {
    $stmt = $conn->prepare("SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $conn->query("SELECT * FROM orders ORDER BY created_at DESC");
}

$orders = [];

while ($row = $result->fetch_assoc()) {
    $orders[] = [
        "id"            => $row["order_code"],       // e.g. #STZ-2026-04821 (used as the display/lookup id)
        "dbId"          => (int)$row["id"],
        "customer"      => $row["customer_name"],
        "email"         => $row["customer_email"],
        "phone"         => $row["customer_phone"],
        "city"          => $row["customer_city"],
        "address"       => $row["customer_address"],
        "date"          => date("Y-m-d", strtotime($row["created_at"])),
        "createdAt"     => $row["created_at"],
        "items"         => json_decode($row["items"], true),
        "subtotal"      => $row["subtotal"] !== null ? (float)$row["subtotal"] : null,
        "discount"      => (float)$row["discount"],
        "shipping"      => (float)$row["shipping"],
        "total"         => (float)$row["total"],
        "paymentMethod" => $row["payment_method"],
        "cardLast4"     => $row["card_last4"],
        "status"        => $row["status"]
    ];
}

echo json_encode($orders);

$conn->close();
?>
