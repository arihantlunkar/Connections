<?php
require_once ROOT_PATH . 'Task.php';

class UploadTask extends Task
{
	private $mUploadTime;
	private $mBiodataTargetFile;
	private $mPicture1TargetFile;
	private $mPicture2TargetFile;
	private $mPicture3TargetFile;
	private $mPicture4TargetFile;
	private $mPicture5TargetFile;
	private $mJSONDecodedFILESData;
	public function trigger() : void
	{
		if ($this->isFakeUser()) {
			throw new CustomMessage(__CLASS__, Constants::FAILURE, 'Fake user upload', 1007);
		}
		if ($this->isUploadLimitReached()) {
			throw new CustomMessage(__CLASS__, Constants::FAILURE, 'Upload limit reached', 2005);
		}
		$this->storeFiles();
		$this->updateDB();
		throw new CustomMessage(__CLASS__, Constants::SUCCESS, 'Files uploaded successfully', 3003);
	}
	protected function validateData() : void
	{
		$this->mJSONDecodedFILESData = json_decode(json_encode($_FILES));
		if (empty($this->mJSONDecodedPOSTData->fromID)) {
			throw new CustomMessage(__class__, Constants::FAILURE, 'Empty data', 1006, '\'fromID\' value is empty');
		} else if (empty($this->mJSONDecodedFILESData->biodata)) {
			throw new CustomMessage(__class__, Constants::FAILURE, 'Empty data', 1006, '\'biodata\' value is empty');
		} else if (empty($this->mJSONDecodedFILESData->picture1)) {
			throw new CustomMessage(__class__, Constants::FAILURE, 'Empty data', 1006, '\'picture1\' value is empty');
		} 
		
		// sanitize
		$this->mJSONDecodedPOSTData->fromID = htmlspecialchars(strip_tags($this->mJSONDecodedPOSTData->fromID));
	}
	
	private function isFakeUser() : bool
	{
		$stmt = $this->mConnection->prepare('SELECT * FROM `users` where id=?');
		if (false === $stmt) {
			throw new CustomMessage(
				__class__,
				Constants::FAILURE,
				'DB error',
				1005,
				'Syntax error or missing privileges error => ' . htmlspecialchars($this->mConnection->error)
			);
		}
		$bindResult = $stmt->bind_param('s', $this->mJSONDecodedPOSTData->fromID);
		if (false === $bindResult) {
			throw new CustomMessage(
				__class__,
				Constants::FAILURE,
				'Corrupt data',
				2001,
				'Bind failed. Possible reason could be inserted data is corrupted => ' . htmlspecialchars($this->mConnection->error)
			);
		}
		$executeResult = $stmt->execute();
		if (false === $executeResult) {
			throw new CustomMessage(
				__class__,
				Constants::FAILURE,
				'Internet connection error',
				2002,
				'Tripping over the network cable => ' . htmlspecialchars($this->mConnection->error)
			);
		}
		$result = $stmt->get_result();
		$stmt->close();
		return $result->num_rows <= 0;
	}
	private function isUploadLimitReached() : bool
	{
		$stmt = $this->mConnection->prepare('SELECT * FROM `upload` WHERE `fromID` = ? and uploadTime >= Date_sub(now(),interval 1 hour)');
		if (false === $stmt) {
			throw new CustomMessage(
				__class__,
				Constants::FAILURE,
				'DB error',
				1005,
				'Syntax error or missing privileges error => ' . htmlspecialchars($this->mConnection->error)
			);
		}
		$bindResult = $stmt->bind_param('i', $this->mJSONDecodedPOSTData->fromID);
		if (false === $bindResult) {
			throw new CustomMessage(
				__class__,
				Constants::FAILURE,
				'Corrupt data',
				2001,
				'Bind failed. Possible reason could be inserted data is corrupted => ' . htmlspecialchars($this->mConnection->error)
			);
		}
		$executeResult = $stmt->execute();
		if (false === $executeResult) {
			throw new CustomMessage(
				__class__,
				Constants::FAILURE,
				'Internet connection error',
				2002,
				'Tripping over the network cable => ' . htmlspecialchars($this->mConnection->error)
			);
		}
		$result = $stmt->get_result();
		$stmt->close();
		if ($result->num_rows >= Constants::UPLOAD_LIMIT) {
			return true;
		}
		return false;
	}
	private function storeFiles() : void
	{
		$this->mUploadTime = date('dmYhis');
		$baseDir = Constants::UPLOAD_DIR_NAME . "/" . $this->mJSONDecodedPOSTData->fromID . "/" . $this->mUploadTime;
		$this->mBiodataTargetFile =  $baseDir . "/Biodata." . Task::getFileExtension($this->mJSONDecodedFILESData->biodata->type);
		$this->mPicture1TargetFile = $baseDir . "/Picture1." . Task::getFileExtension($this->mJSONDecodedFILESData->picture1->type);
		$this->mPicture2TargetFile = !empty($this->mJSONDecodedFILESData->picture2) ? $baseDir . "/Picture2." . Task::getFileExtension($this->mJSONDecodedFILESData->picture2->type) : null;
		$this->mPicture3TargetFile = !empty($this->mJSONDecodedFILESData->picture3) ? $baseDir . "/Picture3." . Task::getFileExtension($this->mJSONDecodedFILESData->picture3->type) : null;
		$this->mPicture4TargetFile = !empty($this->mJSONDecodedFILESData->picture4) ? $baseDir . "/Picture4." . Task::getFileExtension($this->mJSONDecodedFILESData->picture4->type) : null;
		$this->mPicture5TargetFile = !empty($this->mJSONDecodedFILESData->picture5) ? $baseDir . "/Picture5." . Task::getFileExtension($this->mJSONDecodedFILESData->picture5->type) : null;
		if (false === is_dir($baseDir)) {
			mkdir($baseDir, 0777, true);
		}
		if (false === move_uploaded_file($this->mJSONDecodedFILESData->biodata->tmp_name, $this->mBiodataTargetFile)) {
			throw new CustomMessage(__class__, Constants::FAILURE, 'File not uploaded successfully', 2007, 'Biodata not uploaded');
		}
		if (false === move_uploaded_file($this->mJSONDecodedFILESData->picture1->tmp_name, $this->mPicture1TargetFile)) {
			throw new CustomMessage(__class__, Constants::FAILURE, 'File not uploaded successfully', 2007, 'Picture1 not uploaded');
		}
		if (null != $this->mPicture2TargetFile && false === move_uploaded_file($this->mJSONDecodedFILESData->picture2->tmp_name, $this->mPicture2TargetFile)) {
			throw new CustomMessage(__class__, Constants::FAILURE, 'File not uploaded successfully', 2007, 'Picture2 not uploaded');
		}
		if (null != $this->mPicture3TargetFile && false === move_uploaded_file($this->mJSONDecodedFILESData->picture3->tmp_name, $this->mPicture3TargetFile)) {
			throw new CustomMessage(__class__, Constants::FAILURE, 'File not uploaded successfully', 2007, 'Picture3 not uploaded');
		}
		if (null != $this->mPicture4TargetFile && false === move_uploaded_file($this->mJSONDecodedFILESData->picture4->tmp_name, $this->mPicture4TargetFile)) {
			throw new CustomMessage(__class__, Constants::FAILURE, 'File not uploaded successfully', 2007, 'Picture4 not uploaded');
		}
		if (null != $this->mPicture5TargetFile && false === move_uploaded_file($this->mJSONDecodedFILESData->picture5->tmp_name, $this->mPicture5TargetFile)) {
			throw new CustomMessage(__class__, Constants::FAILURE, 'File not uploaded successfully', 2007, 'Picture5 not uploaded');
		}
	}
	private function updateDB() : void
	{
		$this->updateIntoBiodataTable();
		$this->updateIntoUploadTable();
		$this->updateIntoVerificationTable();
	}
	private function updateIntoBiodataTable() : void
	{
		$stmt = $this->mConnection->prepare(
			'INSERT INTO `biodata`(`id`, `biodataLink`, `image1Link`, `image2Link`, `image3Link`, `image4Link`, `image5Link`) values (?, ?, ?, ?, ?, ?, ?)'
		);
		if (false === $stmt) {
			throw new CustomMessage(
				__class__,
				Constants::FAILURE,
				'DB error',
				1005,
				'Syntax error or missing privileges error => ' . htmlspecialchars($this->mConnection->error)
			);
		}
		$bindResult = $stmt->bind_param(
			'sssssss',
			$this->mUploadTime,
			$this->mBiodataTargetFile,
			$this->mPicture1TargetFile,
			$this->mPicture2TargetFile,
			$this->mPicture3TargetFile,
			$this->mPicture4TargetFile,
			$this->mPicture5TargetFile
		);
		if (false === $bindResult) {
			throw new CustomMessage(
				__class__,
				Constants::FAILURE,
				'Corrupt data',
				2001,
				'Bind failed. Possible reason could be inserted data is corrupted => ' . htmlspecialchars($this->mConnection->error)
			);
		}
		$executeResult = $stmt->execute();
		if (false === $executeResult) {
			throw new CustomMessage(
				__class__,
				Constants::FAILURE,
				'Internet connection error',
				2002,
				'Tripping over the network cable => ' . htmlspecialchars($this->mConnection->error)
			);
		}
		$stmt->close();
	}
	private function updateIntoUploadTable() : void
	{
		$stmt = $this->mConnection->prepare(
			'INSERT INTO `upload`(`fromID`, `biodataID`) values (?, ?)'
		);
		if (false === $stmt) {
			throw new CustomMessage(
				__class__,
				Constants::FAILURE,
				'DB error',
				1005,
				'Syntax error or missing privileges error => ' . htmlspecialchars($this->mConnection->error)
			);
		}
		$bindResult = $stmt->bind_param(
			'ss',
			$this->mJSONDecodedPOSTData->fromID,
			$this->mUploadTime
		);
		if (false === $bindResult) {
			throw new CustomMessage(
				__class__,
				Constants::FAILURE,
				'Corrupt data',
				2001,
				'Bind failed. Possible reason could be inserted data is corrupted => ' . htmlspecialchars($this->mConnection->error)
			);
		}
		$executeResult = $stmt->execute();
		if (false === $executeResult) {
			throw new CustomMessage(
				__class__,
				Constants::FAILURE,
				'Internet connection error',
				2002,
				'Tripping over the network cable => ' . htmlspecialchars($this->mConnection->error)
			);
		}
		$stmt->close();
	}
	private function updateIntoVerificationTable() : void
	{
		$isVerified = 0;
		$stmt = $this->mConnection->prepare(
			'INSERT INTO `verification`(`biodataID`, `isVerified`) values (?, ?)'
		);
		if (false === $stmt) {
			throw new CustomMessage(
				__class__,
				Constants::FAILURE,
				'DB error',
				1005,
				'Syntax error or missing privileges error => ' . htmlspecialchars($this->mConnection->error)
			);
		}
		$bindResult = $stmt->bind_param(
			'si',
			$this->mUploadTime,
			$isVerified
		);
		if (false === $bindResult) {
			throw new CustomMessage(
				__class__,
				Constants::FAILURE,
				'Corrupt data',
				2001,
				'Bind failed. Possible reason could be inserted data is corrupted => ' . htmlspecialchars($this->mConnection->error)
			);
		}
		$executeResult = $stmt->execute();
		if (false === $executeResult) {
			throw new CustomMessage(
				__class__,
				Constants::FAILURE,
				'Internet connection error',
				2002,
				'Tripping over the network cable => ' . htmlspecialchars($this->mConnection->error)
			);
		}
		$stmt->close();
	}
}
