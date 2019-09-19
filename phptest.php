<?php

    function getMetaData($filename) {
    $head = file_get_contents($filename, FALSE, NULL, 0, 23040);
    $endpos = strpos($head, 'END') + 3;
    $head = substr($head, 0, $endpos);
    $head_arr = explode(" /", $head);
    return $head_arr;
    }

$testdata_arr = getMetaData('./test.fts');
foreach ($testdata_arr as $line) {
echo "<br>";
echo $line;
}




?>
