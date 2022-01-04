<?php
if (!defined('ROOT_PATH')) {
	define('ROOT_PATH', __DIR__ . DIRECTORY_SEPARATOR);
}
require_once ROOT_PATH . 'Constants.php';
$mConnection = new mysqli(Constants::DB_HOST, Constants::DB_USER, Constants::DB_PASS, Constants::DB_NAME);
$result = $mConnection->query('SELECT * FROM `biodata`, (SELECT `upload`.`fromID`, `upload`.`biodataID`, `upload`.`uploadTime` FROM `upload`, `verification` WHERE `verification`.`isVerified` = 1 AND `verification`.`isValid` = 1 AND `upload`.`biodataID` = `verification`.`biodataID`) AS VERIFICATION_DATA, (SELECT `education`.`biodataID`, GROUP_CONCAT(DISTINCT `education`.`education`) AS `educations` FROM `biodata`, `education` WHERE `biodata`.`id` = `education`.`biodataID` GROUP BY `education`.`biodataID`) AS EDUCATION_DATA WHERE `biodata`.`id` = VERIFICATION_DATA.`biodataID` AND EDUCATION_DATA.`biodataID` = `biodata`.`id` ORDER BY VERIFICATION_DATA.`uploadTime` DESC LIMIT 0, 5;');
$rows = array();
if ($result && $result->num_rows > 0) 
{
	while($r = $result->fetch_assoc()) {
		if(!empty($r['detailedProfession']))
		{
			$r['profession'] = $r['detailedProfession'];
		}
		$rows[] = $r;
	}
}
print_r($rows);
?>