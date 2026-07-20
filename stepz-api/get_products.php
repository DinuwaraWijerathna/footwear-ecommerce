<?php
// Allow the frontend (Live Server / any origin) to call this API
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';

$sql = "SELECT * FROM products ORDER BY id ASC";
$result = $conn->query($sql);

$products = [];

while ($row = $result->fetch_assoc()) {
    $products[] = [
        "id"          => (int)$row["id"],
        "brand"       => $row["brand"],
        "name"        => $row["name"],
        "category"    => $row["category"],
        "price"       => (float)$row["price"],
        "oldPrice"    => $row["old_price"] !== null ? (float)$row["old_price"] : null,
        "badge"       => $row["badge"],
        "rating"      => (float)$row["rating"],
        "reviews"     => (int)$row["reviews"],
        "image"       => $row["image"],
        "sizes"       => array_map('intval', explode(',', $row["sizes"])),
        "description" => $row["description"],
        "inStock"     => (bool)$row["in_stock"]
    ];
}

echo json_encode($products);

$conn->close();
?>
