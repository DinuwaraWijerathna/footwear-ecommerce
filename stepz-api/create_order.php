<?php
// ═══════════════════════════════════════════════
// Saves a new order straight into the MySQL database
// Called from checkout.html / app.js when the customer places an order
// ═══════════════════════════════════════════════
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Preflight request, nothing else to do
    exit();
}

require_once 'db.php';

// ── Read + decode the JSON body sent by fetch() ──
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid or missing JSON body"]);
    exit();
}

// ── Basic validation ──
$required = ['name', 'email', 'phone', 'city', 'address', 'items', 'total'];
foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === '') {
        http_response_code(400);
        echo json_encode(["error" => "Missing required field: $field"]);
        exit();
    }
}

if (!is_array($data['items']) || count($data['items']) === 0) {
    http_response_code(400);
    echo json_encode(["error" => "Order must contain at least one item"]);
    exit();
}

$name          = trim($data['name']);
$email         = trim($data['email']);
$phone         = trim($data['phone']);
$city          = trim($data['city']);
$address       = trim($data['address']);
$items         = $data['items'];
$subtotal      = isset($data['subtotal']) ? (float)$data['subtotal'] : 0;
$discount      = isset($data['discount']) ? (float)$data['discount'] : 0;
$shipping      = isset($data['shipping']) ? (float)$data['shipping'] : 0;
$total         = (float)$data['total'];
$paymentMethod = isset($data['paymentMethod']) ? $data['paymentMethod'] : 'cod';
$cardLast4     = isset($data['cardLast4']) && $data['cardLast4'] !== null ? substr($data['cardLast4'], 0, 4) : null;

$itemsJson = json_encode($items);

// ── Match to an existing registered user (if any), so orders link to a user_id ──
$userId = null;
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
if ($row = $result->fetch_assoc()) {
    $userId = (int)$row['id'];
}
$stmt->close();

// ── Generate a unique, human-friendly order code ──
$year = date('Y');
do {
    $orderCode = '#STZ-' . $year . '-' . str_pad((string)random_int(0, 99999), 5, '0', STR_PAD_LEFT);
    $check = $conn->prepare("SELECT id FROM orders WHERE order_code = ? LIMIT 1");
    $check->bind_param("s", $orderCode);
    $check->execute();
    $exists = $check->get_result()->num_rows > 0;
    $check->close();
} while ($exists);

// ── Insert the order ──
$stmt = $conn->prepare(
    "INSERT INTO orders
        (order_code, user_id, customer_name, customer_email, customer_phone, customer_city, customer_address,
         items, subtotal, discount, shipping, total, payment_method, card_last4, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')"
);

$stmt->bind_param(
    "sissssssddddss",
    $orderCode,
    $userId,
    $name,
    $email,
    $phone,
    $city,
    $address,
    $itemsJson,
    $subtotal,
    $discount,
    $shipping,
    $total,
    $paymentMethod,
    $cardLast4
);

if ($stmt->execute()) {
    echo json_encode([
        "success"    => true,
        "orderCode"  => $orderCode,
        "id"         => $stmt->insert_id,
        "message"    => "Order saved successfully"
    ]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to save order: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
