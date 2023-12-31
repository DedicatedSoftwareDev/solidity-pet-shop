pragma solidity ^0.4.17;

//global Truffle files, not a truffle directory. You should not see a truffle directory inside your test/ directory.
// disregard compiler errors
import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
//The smart contract we want to test.
import "../contracts/Adoption.sol";

contract TestAdoption {
    //define a contract-wide variable containing the smart contract to be tested, 
    //calling the DeployedAddresses smart contract to get its address.
    Adoption adoption = Adoption(DeployedAddresses.Adoption());

    // testing the adopt() function
    function testUserCanAdoptPet() public {
        //call the smart contract we declared earlier with the ID of 4.
        uint returnedId = adoption.adopt(4);
        //expected value of 4 
        uint expected = 4;
        //pass the actual value, the expected value and a failure message 
        Assert.equal(returnedId, expected, "Adoption of pet ID 4 should be recorded.");
    }

    // testing retrieval of a single pet's owner
    function testGetAdopterAddressByPetId() public {
        // expected owner is this contract
        //Since the TestAdoption contract will be sending the transaction, we set the expected value to this
        address expected = this;

        address adopter = adoption.adopters(4);

        Assert.equal(adopter, expected, "Owner of pet ID 4 should be recorded.");
    }

    // Testing retrieval of all pet owners
    function testGetAdopterAddressByPetIdInArray() public {
        // Expected owner is this contract
        address expected = this;
        // Store adopters in memory rather than contract's storage
        //The memory attribute tells Solidity to temporarily store the value in memory, rather than saving it to the contract's storage. 
        address[16] memory adopters = adoption.getAdopters();
        //Since adopters is an array, and we know from the first adoption test that we adopted pet 4, we compare the testing contracts address with location 4 in the array.
        Assert.equal(adopters[4], expected, "Owner of pet ID 4 should be recorded.");
    }
}