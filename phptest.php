<?php
    function getMetaData($filename) {
    $head = file_get_contents($filename, FALSE, NULL, 0, 23040);
    $endpost = strpost($testdata, 'END') + 3;
    $head_arr = explode(" /", $testdata);
    return $head_arr;
    }

$testdata_arr = getMetaData('./test.fts');
foreach ($testdata_arr as $line) {
echo "<br>";
echo $line;
}




?>
