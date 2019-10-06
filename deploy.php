<?php

	$postBody;
	if($_POST['payload']){
			$postBody = $_POST['payload'];
		  $payload = json_decode($postBody);
			$repo = $payload->ref;
	} else {
		$repo = "";
	}
	if(strpos($repo, 'master') != false || !$payload){
		$run = true;
	}
	$commands = array(
        'cd /var/www/html/active/gtn/archive'
		'echo $PWD',
		'whoami',
		'git fetch',
		'git reset --hard origin/master',
		'git pull',
		'git status',
		'git submodule sync',
		'git submodule update',
		'git submodule status',
        'cd /var/www/html/active/gtn/archive/site',
        'npm install',
        'npm build',
        'cp /var/www/html/active/gtn/archive/site/build/* /var/www/html/active/gtn/archive/build/'
	);
	if($run == true){
	// Run the commands for output
	$output = '';
	foreach($commands AS $command){
		// Run it
		$tmp = shell_exec($command);
		// Output
		$output .= "<span style=\"color: #6BE234;\">\$</span> <span style=\"color: #729FCF;\">{$command}\n</span>";
		$output .= htmlentities(trim($tmp)) . "\n";
	}
}
	// Make it pretty for manual user access (and why not?)
?>
<!DOCTYPE HTML>
<html lang="en-US">
<head>
	<meta charset="UTF-8">
	<title>GIT DEPLOYMENT SCRIPT</title>
</head>
<body style="background-color: #000000; color: #FFFFFF; font-weight: bold; padding: 0 10px;">
<pre>
 ____________________________
|                            |
| Git Deployment Script v0.1 |
|      github.com/riodw 2017 |
|____________________________|

<?php echo $output; ?>
</pre>
</body>
</html>