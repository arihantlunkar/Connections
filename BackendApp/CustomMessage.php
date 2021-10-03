<?php
class CustomMessage extends Exception
{
	private $mModule;
	private $mStatus;
	private $mOutputDataArr;
	private $mDescription;
	public function __construct($module, $status, $message, $code, $description = '', $outputDataArr = null, Exception $previous = null)
	{
		parent::__construct($message, $code, $previous);
		$this->mModule = $module;
		$this->mStatus = (1 === $status) ? 'Success' : 'Failure';
		$this->mDescription = $description;
		$this->mOutputDataArr = $outputDataArr;
	}
	public function get() : string
	{
		return json_encode(
			array(
				'module' => $this->mModule,
				'status' => $this->mStatus,
				'message' => $this->message,
				'code' => $this->code,
				'description' => $this->mDescription,
				'data' => $this->mOutputDataArr
			),
			JSON_PRETTY_PRINT
		);
	}
}
