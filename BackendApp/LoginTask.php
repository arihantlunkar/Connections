<?php
require_once ROOT_PATH . 'Task.php';

class LoginTask extends Task
{
	var $saved_id = '';
	
	public function trigger() : void
	{
		if ($this->updateIfExists()) {
		} else {
			$this->insert();
		}
	}
	protected function validateData() : void
	{
		if (empty($this->mJSONDecodedPOSTData->socialMedia)) {
			throw new CustomMessage(__class__, Constants::FAILURE, 'Empty data', 1006, '\'socialMedia\' value is empty');
		} else if (empty($this->mJSONDecodedPOSTData->socialMediaID)) {
			throw new CustomMessage(__class__, Constants::FAILURE, 'Empty data', 1006, '\'socialMediaID\' value is empty');
		} else if (empty($this->mJSONDecodedPOSTData->name)) {
			throw new CustomMessage(__class__, Constants::FAILURE, 'Empty data', 1006, '\'name\' value is empty');
		} else if (empty($this->mJSONDecodedPOSTData->email)) {
			throw new CustomMessage(__class__, Constants::FAILURE, 'Empty data', 1006, '\'email\' value is empty');
		}
		$this->mJSONDecodedPOSTData->pictureURL = !empty($this->mJSONDecodedPOSTData->pictureURL) ? $this->mJSONDecodedPOSTData->pictureURL : null;
		
		// sanitize
		$this->mJSONDecodedPOSTData->socialMedia = htmlspecialchars(strip_tags($this->mJSONDecodedPOSTData->socialMedia));
		$this->mJSONDecodedPOSTData->socialMediaID = htmlspecialchars(strip_tags($this->mJSONDecodedPOSTData->socialMediaID));
		$this->mJSONDecodedPOSTData->name = htmlspecialchars(strip_tags($this->mJSONDecodedPOSTData->name));
		$this->mJSONDecodedPOSTData->email = htmlspecialchars(strip_tags($this->mJSONDecodedPOSTData->email));
		$this->mJSONDecodedPOSTData->pictureURL = htmlspecialchars(strip_tags($this->mJSONDecodedPOSTData->pictureURL));
	}
	private function updateIfExists() : bool
	{
		$stmt = $this->mConnection->prepare('SELECT * FROM `users` where socialMedia=? and socialMediaID=?');
		if (false === $stmt) {
			throw new CustomMessage(
				__class__,
				Constants::FAILURE,
				'DB error',
				1005,
				'Syntax error or missing privileges error => ' . htmlspecialchars($this->mConnection->error)
			);
		}
		$bindResult = $stmt->bind_param('ss', $this->mJSONDecodedPOSTData->socialMedia, $this->mJSONDecodedPOSTData->socialMediaID);
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
		if ($result->num_rows > 0) {
			$row = $result->fetch_assoc();
			
			$stmt = $this->mConnection->prepare(
				'Update `users` set `socialMedia`=?, `socialMediaID`=?, `name`=?, `email`=?, `pictureURL`=? where `id`=?'
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
				'sssssi',
				$this->mJSONDecodedPOSTData->socialMedia,
				$this->mJSONDecodedPOSTData->socialMediaID,
				$this->mJSONDecodedPOSTData->name,
				$this->mJSONDecodedPOSTData->email,
				$this->mJSONDecodedPOSTData->pictureURL,
				$row['id']
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
			throw new CustomMessage(__class__, Constants::SUCCESS, 'User record updated successfully', 3001, 'ID', $row['id']);
			return true;
		}
		return false;
	}
	
	private function insert() : void
	{
		$id = date('dmYhis');
		$stmt = $this->mConnection->prepare(
			'INSERT INTO `users`(`id`, `socialMedia`, `socialMediaID`, `name`, `email`, `pictureURL`) values (?, ?, ?, ?, ?, ?)'
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
			'isssss',
			$id,
			$this->mJSONDecodedPOSTData->socialMedia,
			$this->mJSONDecodedPOSTData->socialMediaID,
			$this->mJSONDecodedPOSTData->name,
			$this->mJSONDecodedPOSTData->email,
			$this->mJSONDecodedPOSTData->pictureURL
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
		throw new CustomMessage(__class__, Constants::SUCCESS, 'User record inserted successfully', 3002, 'ID', $id);
	}
}
