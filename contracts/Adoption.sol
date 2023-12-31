//The minimum version of Solidity required 
pragma solidity ^0.4.17;

contract Adoption {
    //type is address and the length is 16
    //public variables have automatic getter methods
    address[16] public adopters;

    // Adopting a pet
    function adopt(uint _petId) public returns(uint) {
        // check if petId is in range of our adopters array
        require(_petId >= 0 && _petId <= 15);
        // The address of the person or smart contract who called this function is denoted by msg.sender
        adopters[_petId] = msg.sender;
        //the types of both the function parameters and output must be specified. In this case taking in a petId (integer) and returning an integer.
        return _petId;
    }

    // Retrieving the adopters
    function getAdopters() public view returns (address[16]) {
        // Since adopters is already declared, we can simply return it. Be sure to specify the return type as address[16].
        return adopters;
    }
}