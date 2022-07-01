//SPDX-License-Identifier: GPL;

pragma solidity ^0.8.0;

contract faucet {
    //state variable to keep track of owner and amount of KLAY to dispense
    address public owner;
    uint public amountAllowed = 20000000000000000000;

    struct Requester {
        address beneficiary;
        uint lockTime;
        uint timeReq;
    }

    // array to keep track requesters
    address[] requesters;

    // event to be emitted when KLAY is sent out
    event sent(address _addr, uint _amount, uint _timeReq);
    event paid(address _sender, uint _amount);


    // mapping of each address to Requester struct
    mapping (address => Requester) requesterDet;

    //constructor to set the owner
	constructor() payable {
		owner = msg.sender;
	}

    //function modifier
    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can call this function.");
        _; 
    }

    //function to change the owner.  Only the owner of the contract can call this function
    function setOwner(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    //function to set the amount allowable to be claimed. Only the owner can call this function
    function setAmountallowed(uint newAmountAllowed) public onlyOwner {
        amountAllowed = newAmountAllowed;
    }


    //function to send tokens from faucet to an address
    function sendKlay(address payable _beneficiary) public payable returns(address){
        Requester storage req = requesterDet[msg.sender];

        //perform a few checks to make sure function can execute
        require(block.timestamp > req.lockTime, "lock time has not expired. Please try again later");
        require(address(this).balance >= amountAllowed, "Not enough funds in the faucet. Please donate");

        // sets requester;
        req.beneficiary = _beneficiary;
        // sets time requested
        req.timeReq = block.timestamp;
        //if the balance of this contract is greater then the requested amount send funds
        _beneficiary.transfer(amountAllowed);        

        //updates locktime 1 day from now
        req.lockTime = block.timestamp + 1 days;

        requesters.push(msg.sender);
        // emits sent event
        emit sent(_beneficiary, amountAllowed, block.timestamp);
        return msg.sender;
    }


    // function to get details of Requesters
    function getAllRequesterDet(address[] memory _requesters) public view returns(Requester[] memory _r) {
        require(_requesters.length > 0, "Invalid length");
        _r = new Requester[](_requesters.length);
        for(uint i = 0; i < _requesters.length; i++) {
            _r[i] = requesterDet[_requesters[i]];
        }
    }

    // function to get list of address that already requested for KLAY
    function getAllRequesterAddr() public view returns(address[] memory _r) {
        require(requesters.length > 0, "Invalid length");
        _r = new address[](requesters.length);
        for(uint i = 0; i < requesters.length; i++) {
            _r[i] = requesters[i];
        }
    }

    function getFaucetBalance() public view returns(uint) {
        return address(this).balance;
    }

    function getRequesterLength() public view returns(uint) {
        return requesters.length;
    }

    //function to donate funds to the faucet contract
	receive() external payable {
        emit paid(msg.sender, msg.value);
	}
}