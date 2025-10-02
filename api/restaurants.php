<?php
header('Content-Type: application/json');
$restaurants = json_decode(file_get_contents("./restaurants.json"), true);
if (isset($_GET['search'])) {
    $search = strtolower($_GET['search']);
    $restaurants = array_filter($restaurants, function ($r) use ($search) {
        return strpos(strtolower($r['name']), $search) !== false ||
            strpos(strtolower($r['location']), $search) !== false ||
            strpos(strtolower($r['cuisine']), $search) !== false;
    });
}

if (isset($_GET['sort_by'])) {
    $sortBy = $_GET['sort_by'];
    usort($restaurants, function ($a, $b) use ($sortBy) {
        return strcmp($a[$sortBy], $b[$sortBy]);
    });
}

echo json_encode(array_values($restaurants));
