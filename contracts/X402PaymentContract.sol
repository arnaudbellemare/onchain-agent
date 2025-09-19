// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title X402PaymentContract
 * @dev Smart contract for x402 protocol micropayments
 * Enables per-request API payments with USDC on Base network
 */
contract X402PaymentContract is ReentrancyGuard, Ownable {
    // USDC token contract address on Base
    IERC20 public immutable usdcToken;
    
    // Payment tracking
    mapping(bytes32 => bool) public paymentProofs;
    mapping(address => uint256) public totalPayments;
    mapping(address => uint256) public totalRequests;
    
    // Fee configuration
    uint256 public platformFee = 0; // 0% platform fee by default
    uint256 public constant FEE_DENOMINATOR = 10000; // 0.01% precision
    
    // Events
    event PaymentMade(
        address indexed payer,
        address indexed recipient,
        uint256 amount,
        bytes32 indexed requestId,
        uint256 timestamp
    );
    
    event PaymentVerified(
        bytes32 indexed requestId,
        address indexed payer,
        uint256 amount,
        bool success
    );
    
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    
    // Errors
    error InsufficientBalance();
    error PaymentAlreadyProcessed();
    error InvalidAmount();
    error TransferFailed();
    error Unauthorized();
    
    constructor(address _usdcToken) {
        usdcToken = IERC20(_usdcToken);
    }
    
    /**
     * @dev Make a micropayment for API access
     * @param recipient The API provider's address
     * @param amount The payment amount in USDC (6 decimals)
     * @param requestId Unique identifier for this API request
     */
    function makePayment(
        address recipient,
        uint256 amount,
        bytes32 requestId
    ) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        if (paymentProofs[requestId]) revert PaymentAlreadyProcessed();
        
        // Check payer's USDC balance
        if (usdcToken.balanceOf(msg.sender) < amount) {
            revert InsufficientBalance();
        }
        
        // Calculate platform fee
        uint256 feeAmount = (amount * platformFee) / FEE_DENOMINATOR;
        uint256 recipientAmount = amount - feeAmount;
        
        // Transfer USDC to recipient
        bool success = usdcToken.transferFrom(msg.sender, recipient, recipientAmount);
        if (!success) revert TransferFailed();
        
        // Transfer platform fee to owner if applicable
        if (feeAmount > 0) {
            success = usdcToken.transferFrom(msg.sender, owner(), feeAmount);
            if (!success) revert TransferFailed();
        }
        
        // Record payment proof
        paymentProofs[requestId] = true;
        totalPayments[msg.sender] += amount;
        totalRequests[recipient] += 1;
        
        emit PaymentMade(
            msg.sender,
            recipient,
            amount,
            requestId,
            block.timestamp
        );
    }
    
    /**
     * @dev Verify a payment proof
     * @param requestId The request ID to verify
     * @param payer The expected payer address
     * @param amount The expected payment amount
     * @return success Whether the payment proof is valid
     */
    function verifyPayment(
        bytes32 requestId,
        address payer,
        uint256 amount
    ) external view returns (bool success) {
        success = paymentProofs[requestId];
        
        emit PaymentVerified(requestId, payer, amount, success);
    }
    
    /**
     * @dev Batch verify multiple payment proofs
     * @param requestIds Array of request IDs to verify
     * @return results Array of verification results
     */
    function batchVerifyPayments(
        bytes32[] calldata requestIds
    ) external view returns (bool[] memory results) {
        results = new bool[](requestIds.length);
        
        for (uint256 i = 0; i < requestIds.length; i++) {
            results[i] = paymentProofs[requestIds[i]];
        }
    }
    
    /**
     * @dev Get payment statistics for an address
     * @param user The user address
     * @return totalPaid Total amount paid by the user
     * @return totalRequests Total requests made to the user (if they're a provider)
     */
    function getPaymentStats(address user) external view returns (
        uint256 totalPaid,
        uint256 totalRequests
    ) {
        totalPaid = totalPayments[user];
        totalRequests = totalRequests[user];
    }
    
    /**
     * @dev Update platform fee (only owner)
     * @param newFee New platform fee in basis points (100 = 1%)
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        if (newFee > 1000) revert InvalidAmount(); // Max 10% fee
        
        uint256 oldFee = platformFee;
        platformFee = newFee;
        
        emit PlatformFeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Emergency withdraw function (only owner)
     * @param token Token address to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
    
    /**
     * @dev Get contract information
     * @return usdcAddress USDC token address
     * @return platformFeeBps Platform fee in basis points
     * @return totalPaymentsCount Total number of payments made
     */
    function getContractInfo() external view returns (
        address usdcAddress,
        uint256 platformFeeBps,
        uint256 totalPaymentsCount
    ) {
        usdcAddress = address(usdcToken);
        platformFeeBps = platformFee;
        totalPaymentsCount = address(this).balance; // This would need to be tracked separately
    }
}

/**
 * @title X402PaymentFactory
 * @dev Factory contract for deploying X402PaymentContract instances
 */
contract X402PaymentFactory {
    event ContractDeployed(address indexed contractAddress, address indexed owner);
    
    function deployPaymentContract(address usdcToken) external returns (address) {
        X402PaymentContract newContract = new X402PaymentContract(usdcToken);
        newContract.transferOwnership(msg.sender);
        
        emit ContractDeployed(address(newContract), msg.sender);
        
        return address(newContract);
    }
}
