<?php
//// number of seconds a script is allowed to run
set_time_limit(60);
// No errors should be shown. Only custom error pertaining to this app
//error_reporting(0);
if (!defined('ROOT_PATH')) {
	define('ROOT_PATH', __DIR__ . DIRECTORY_SEPARATOR);
}
require_once ROOT_PATH . 'CustomMessage.php';
require_once ROOT_PATH . 'TaskFactory.php';
try {
	if ('POST' !== $_SERVER['REQUEST_METHOD']) {
		throw new CustomMessage(__class__, Constants::FAILURE, 'Only POST request allowed', 1001);
	}
	$jsonDecodedPOSTData = json_decode(json_encode($_POST));
	TaskFactory::get($jsonDecodedPOSTData)->trigger();
} catch (CustomMessage $e) {
	header('Content-Type: application/json');
	echo $e->get();
}
