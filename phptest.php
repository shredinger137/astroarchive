<?php

$testdata = file_get_contents('./test.fts', FALSE, NULL, 0, 23040);
$endpos = strpos($testdata, 'END') + 3;
$testdata = substr($testdata, 0, $endpos);
$testdata_arr = explode(" /", $testdata);
foreach ($testdata_arr as $line) {
echo "<br>";
echo $line;
}




?>
