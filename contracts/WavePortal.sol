// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
    struct Wave {
        address waver; // The address of the user who waved.
        string message; // The message the user sent.
        uint256 timestamp; // The timestamp when the user waved.
    }

    event NewWave(
        address indexed from, 
        string message,
        uint256 timestamp
    );

    event PrizeMoneySent(
        address receiver,
        uint256 amount
    );

    // State variable stored permanently in smart contract storage
    uint256 public totalWaveCount;
    Wave[] public waves;
    uint256 private seed;
        address payable public owner;


    constructor() payable {
         owner = payable(msg.sender);

        console.log("Yo yo, I am a contract am I am smart");
    }

     modifier onlyOwner () {
       require(msg.sender == owner, "This can only be called by the contract owner!");
       _;
     }


    function withdraw() onlyOwner payable public {
         //msg.sender.transfer(address(this).balance);
        // (bool success, ) = (msg.sender).call{value: prizeAmount}("");
        uint256 balance = address(this).balance;
        (bool success, ) = (msg.sender).call{value: balance}("transfered financier");
        require(success, "Failed to withdraw money from contract.");


     }

    function getBalance() public view returns (uint256) {
         return address(this).balance;
     }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function  wave(string memory _message) payable public {
        totalWaveCount += 1;
        // msg.sender = wallet address of function callee
        Wave memory wv = Wave(msg.sender, _message, block.timestamp);
        waves.push(wv);

        uint exactAmount = .05 ether;
        console.log('msg', msg.value);
        require (msg.value == exactAmount);

        emit NewWave(msg.sender, _message, block.timestamp);

        uint256 randomNumber = (block.difficulty + block.timestamp + seed) % 100;
        console.log("Random # generated: %s", randomNumber);
        seed = randomNumber;

        if (randomNumber < 50) {
            console.log("winner winner chicken dinna");
            uint256 prizeAmount = .5 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than they contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
            emit PrizeMoneySent(msg.sender, prizeAmount);
        }


    }
}