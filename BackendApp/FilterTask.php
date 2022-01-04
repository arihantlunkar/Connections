<?php
require_once ROOT_PATH . 'Task.php';

class FilterTask extends Task
{
	public function trigger() : void
	{
		$Age = isset($this->mJSONDecodedPOSTData->Age) && 0 != count($this->mJSONDecodedPOSTData->Age) ? " AND `biodata`.`age` IN ('".implode("', '", $this->mJSONDecodedPOSTData->Age)."')" : "";
		$Dosha = isset($this->mJSONDecodedPOSTData->Dosha) && 0 != count($this->mJSONDecodedPOSTData->Dosha) ? " AND `biodata`.`dosha` IN ('".implode("', '", $this->mJSONDecodedPOSTData->Dosha)."')" : "";
		$Education = '';
		for ($i = 0; isset($this->mJSONDecodedPOSTData->Education) && $i < count($this->mJSONDecodedPOSTData->Education); $i++)  {
			$Education .= (0 == $i ? ' AND ( ' : '')."EDUCATION_DATA.`educations` LIKE '%".$this->mJSONDecodedPOSTData->Education[$i]."%' ".($i == count($this->mJSONDecodedPOSTData->Education) - 1 ? ')' : 'OR ');
        }
		$Height = isset($this->mJSONDecodedPOSTData->Height) && 0 != count($this->mJSONDecodedPOSTData->Height) ? " AND `biodata`.`height` IN ('".implode("', '", $this->mJSONDecodedPOSTData->Height)."')" : "";
		$Looking_For = isset($this->mJSONDecodedPOSTData->Looking_For) && 0 != count($this->mJSONDecodedPOSTData->Looking_For) ? " AND `biodata`.`lookingFor` IN ('".implode("', '", $this->mJSONDecodedPOSTData->Looking_For)."')" : "";
		$Marital_Status = isset($this->mJSONDecodedPOSTData->Marital_Status) && 0 != count($this->mJSONDecodedPOSTData->Marital_Status) ? " AND `biodata`.`maritialStatus` IN ('".implode("', '", $this->mJSONDecodedPOSTData->Marital_Status)."')" : "";
		$Occupation = isset($this->mJSONDecodedPOSTData->Occupation) && 0 !=count($this->mJSONDecodedPOSTData->Occupation) ? " AND `biodata`.`occupation` IN ('".implode("', '", $this->mJSONDecodedPOSTData->Occupation)."')" : "";
		$Profession = isset($this->mJSONDecodedPOSTData->Profession) && 0 != count($this->mJSONDecodedPOSTData->Profession) ? " AND `biodata`.`profession` IN ('".implode("', '", $this->mJSONDecodedPOSTData->Profession)."')" : "";
		$Sampradaya = isset($this->mJSONDecodedPOSTData->Sampradaya) && 0 != count($this->mJSONDecodedPOSTData->Sampradaya) ? " AND `biodata`.`sampradaya` IN ('".implode("', '", $this->mJSONDecodedPOSTData->Sampradaya)."')" : "";
		$State = isset($this->mJSONDecodedPOSTData->State) && 0 != count($this->mJSONDecodedPOSTData->State) ? " AND `biodata`.`place` REGEXP '".implode("|", $this->mJSONDecodedPOSTData->State)."'" : "";
		$result = $this->mConnection->query('SELECT * FROM `biodata`, `verification`, (SELECT `biodata`.`id`, GROUP_CONCAT(DISTINCT `education`.`education`) AS `educations` FROM `biodata`, `education` WHERE `biodata`.`id` = `education`.`biodataID` GROUP BY `biodata`.`id`) AS EDUCATION_DATA WHERE `biodata`.`id` = `verification`.`biodataID` AND `biodata`.`id` = EDUCATION_DATA.`id` AND `verification`.`isValid` = 1'.$Age.$Dosha.$Education.$Height.$Looking_For.$Marital_Status.$Occupation.$Profession.$Sampradaya.$State.' ORDER BY `verification`.`verifiedTime` DESC LIMIT '.$this->mJSONDecodedPOSTData->currentPosition.', 5;');
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
		throw new CustomMessage(__CLASS__, Constants::SUCCESS, 'Filter Results', 3003, '', $rows);
	}
	protected function validateData() : void {}
}
