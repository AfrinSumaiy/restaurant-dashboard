<?php
header('Content-Type: application/json');
$orders = json_decode(file_get_contents(__DIR__ . "/orders.json"), true);
$restaurants = json_decode(file_get_contents(__DIR__ . "/restaurants.json"), true);

$revenueByRestaurant = [];

foreach ($orders as $o) {
    $id = $o['restaurant_id'];
    $revenueByRestaurant[$id] = ($revenueByRestaurant[$id] ?? 0) + $o['order_amount'];
}

arsort($revenueByRestaurant);

$top3 = array_slice($revenueByRestaurant, 0, 3, true);

$result = [];
foreach ($top3 as $id => $revenue) {
    $restaurant = array_values(array_filter($restaurants, fn($r) => $r['id'] === $id))[0];
    $result[] = [
        "id" => $id,
        "name" => $restaurant['name'],
        "location" => $restaurant['location'],
        "revenue" => $revenue
    ];
}

echo json_encode($result);
