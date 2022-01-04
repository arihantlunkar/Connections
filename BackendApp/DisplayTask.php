<?php
require_once ROOT_PATH . 'Task.php';

class DisplayTask extends Task
{
	public function trigger() : void
	{
		$result = $this->mConnection->query('SELECT * FROM `biodata`, (SELECT `upload`.`fromID`, `upload`.`biodataID`, `upload`.`uploadTime` FROM `upload`, `verification` WHERE `verification`.`isVerified` = 1 AND `verification`.`isValid` = 1 AND `upload`.`biodataID` = `verification`.`biodataID`) AS VERIFICATION_DATA, (SELECT `education`.`biodataID`, GROUP_CONCAT(DISTINCT `education`.`education`) AS `educations` FROM `biodata`, `education` WHERE `biodata`.`id` = `education`.`biodataID` GROUP BY `education`.`biodataID`) AS EDUCATION_DATA WHERE `biodata`.`id` = VERIFICATION_DATA.`biodataID` AND EDUCATION_DATA.`biodataID` = `biodata`.`id` ORDER BY VERIFICATION_DATA.`uploadTime` DESC LIMIT '.$this->mJSONDecodedPOSTData->currentPosition.', 5;');
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