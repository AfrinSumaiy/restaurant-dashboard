<?php
header('Content-Type: application/json');
$orders = json_decode(file_get_contents(__DIR__ . "/orders.json"), true);

if (isset($_GET['restaurant_id'])) {
    $restaurant_id = intval($_GET['restaurant_id']);
    $orders = array_filter($orders, fn($o) => $o['restaurant_id'] === $restaurant_id);
}

if (isset($_GET['start_date'])) {
    $start = strtotime($_GET['start_date']);
    $orders = array_filter($orders, fn($o) => strtotime($o['order_time']) >= $start);
}

if (isset($_GET['end_date'])) {
    $end = strtotime($_GET['end_date']);
    $orders = array_filter($orders, fn($o) => strtotime($o['order_time']) <= $end);
}

if (isset($_GET['min_amount'])) {
    $min = floatval($_GET['min_amount']);
    $orders = array_filter($orders, fn($o) => $o['order_amount'] >= $min);
}

if (isset($_GET['max_amount'])) {
    $max = floatval($_GET['max_amount']);
    $orders = array_filter($orders, fn($o) => $o['order_amount'] <= $max);
}

if (isset($_GET['min_hour'])) {
    $minHour = intval($_GET['min_hour']);
    $orders = array_filter($orders, fn($o) => intval(date('H', strtotime($o['order_time']))) >= $minHour);
}

if (isset($_GET['max_hour'])) {
    $maxHour = intval($_GET['max_hour']);
    $orders = array_filter($orders, fn($o) => intval(date('H', strtotime($o['order_time']))) <= $maxHour);
}

echo json_encode(array_values($orders));
