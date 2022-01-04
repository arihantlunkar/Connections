<?php
require_once ROOT_PATH . 'Task.php';

class DisplayTask extends Task
{
	public function trigger() : void
	{
		$result = $this->mConnection->query('SELECT * FROM `biodata`, `verification`, (SELECT `biodata`.`id`, GROUP_CONCAT(DISTINCT `education`.`education`) AS `educations` FROM `biodata`, `education` WHERE `biodata`.`id` = `education`.`biodataID` GROUP BY `biodata`.`id`) AS EDUCATION_DATA WHERE `biodata`.`id` = `verification`.`biodataID` AND `biodata`.`id` = EDUCATION_DATA.`id` AND `verification`.`isValid` = 1 ORDER BY `verification`.`verifiedTime` DESC LIMIT '.$this->mJSONDecodedPOSTData->currentPosition.', 5;');
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
		throw new CustomMessage(__CLASS__, Constants::SUCCESS, 'Display Results', 3003, '', $rows);
	}
	protected function validateData() : void {}
}