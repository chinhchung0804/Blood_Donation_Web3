// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title A Wallet Contract for Blood Donation Campaigns
/// @dev Manages Ether donations and MTK token rewards
contract Wallet {
    /// @dev Emitted when Ether is donated
    /// @param donor The address donating Ether
    /// @param amount The amount of Ether donated
    event Donated(address indexed donor, uint amount);

    /// @dev Emitted when ERC20 tokens are claimed
    /// @param claimant The address claiming the tokens
    /// @param tokenAmount The amount of tokens claimed
    event Claimed(address indexed claimant, uint tokenAmount);

    /// @notice Address of the ERC20 token used for rewards
    IERC20 public rewardToken;

    /// @notice Address of the contract owner
    address public owner;

    /// @notice Total amount of Ether donated to the contract
    uint256 public totalDonations;

    /// @notice Mapping to track user balances (Ether donated by each user)
    mapping(address => uint) public balances;

    /// @notice Mapping to track if a user has claimed their reward
    mapping(address => bool) public hasClaimed;

    /// @notice Minimum donation required to be eligible for a reward (in wei)
    uint256 public constant MINIMUM_DONATION = 0.01 ether;

    /// @notice Constructor to initialize the ERC20 token address and set the owner
    /// @param tokenAddress The address of the ERC20 token contract
    constructor(address tokenAddress) {
        rewardToken = IERC20(tokenAddress);
        owner = msg.sender;
    }

    /// @notice Donate Ether to the contract
    /// @dev Increases the sender's balance and emits a Donated event
    function donate() external payable {
        require(msg.value > 0, "You must send some Ether");
        balances[msg.sender] += msg.value;
        totalDonations += msg.value;
        emit Donated(msg.sender, msg.value);
    }

    /// @notice Claim exactly 1 MTK token as a reward
    /// @dev Sends 1 MTK token to the caller if they meet the conditions
    function claimReward() external {
        // Kiểm tra xem người dùng đã quyên góp đủ chưa
        require(balances[msg.sender] >= MINIMUM_DONATION, "Must donate at least 0.01 ETH to claim reward");
        
        // Kiểm tra xem người dùng đã nhận thưởng chưa
        require(!hasClaimed[msg.sender], "Reward already claimed");

        uint tokenAmount = 1 * 10 ** 18; // 1 token (assuming 18 decimals)
        require(
            rewardToken.balanceOf(address(this)) >= tokenAmount,
            "Not enough tokens in the contract"
        );

        // Đánh dấu người dùng đã nhận thưởng
        hasClaimed[msg.sender] = true;

        // Chuyển 1 MTK token cho người dùng
        bool success = rewardToken.transfer(msg.sender, tokenAmount);
        require(success, "Token transfer failed");

        emit Claimed(msg.sender, tokenAmount);
    }

    /// @notice Retrieves the Ether balance of the contract
    /// @return The balance of Ether in the contract
    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }

    /// @notice Retrieves the balance of a specific user
    /// @param user The user's address
    /// @return The Ether balance associated with the user
    function getUserBalance(address user) public view returns (uint) {
        return balances[user];
    }

    /// @notice Allows the owner to withdraw all Ether from the contract
    /// @dev Only the owner can call this function
    function withdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        uint balance = address(this).balance;
        require(balance > 0, "No Ether to withdraw");
        payable(owner).transfer(balance);
    }
}