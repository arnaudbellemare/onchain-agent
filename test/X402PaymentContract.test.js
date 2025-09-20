const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("X402PaymentContract", function () {
  let x402Contract;
  let usdcToken;
  let owner;
  let payer;
  let recipient;
  let mockUSDC;

  // USDC addresses for testing
  const USDC_ADDRESSES = {
    base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
  };

  beforeEach(async function () {
    [owner, payer, recipient] = await ethers.getSigners();

    // Deploy mock USDC token for testing
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();

    // Deploy X402PaymentContract
    const X402PaymentContract = await ethers.getContractFactory("X402PaymentContract");
    x402Contract = await X402PaymentContract.deploy(await mockUSDC.getAddress());
    await x402Contract.waitForDeployment();

    // Mint USDC to payer for testing
    await mockUSDC.mint(payer.address, ethers.parseUnits("1000", 6)); // 1000 USDC
  });

  describe("Deployment", function () {
    it("Should set the correct USDC token address", async function () {
      const contractInfo = await x402Contract.getContractInfo();
      expect(contractInfo.usdcAddress).to.equal(await mockUSDC.getAddress());
    });

    it("Should set the correct owner", async function () {
      expect(await x402Contract.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero platform fee", async function () {
      const contractInfo = await x402Contract.getContractInfo();
      expect(contractInfo.platformFeeBps).to.equal(0);
    });
  });

  describe("Payment Functionality", function () {
    it("Should allow making a payment", async function () {
      const amount = ethers.parseUnits("10", 6); // 10 USDC
      const requestId = ethers.keccak256(ethers.toUtf8Bytes("test-request-1"));

      // Approve USDC spending
      await mockUSDC.connect(payer).approve(await x402Contract.getAddress(), amount);

      // Make payment
      await expect(x402Contract.connect(payer).makePayment(recipient.address, amount, requestId))
        .to.emit(x402Contract, "PaymentMade")
        .withArgs(payer.address, recipient.address, amount, requestId, await time.latest() + 1);

      // Verify payment proof
      expect(await x402Contract.paymentProofs(requestId)).to.be.true;
    });

    it("Should prevent duplicate payments", async function () {
      const amount = ethers.parseUnits("10", 6);
      const requestId = ethers.keccak256(ethers.toUtf8Bytes("test-request-2"));

      // Approve and make first payment
      await mockUSDC.connect(payer).approve(await x402Contract.getAddress(), amount);
      await x402Contract.connect(payer).makePayment(recipient.address, amount, requestId);

      // Try to make duplicate payment
      await expect(
        x402Contract.connect(payer).makePayment(recipient.address, amount, requestId)
      ).to.be.revertedWithCustomError(x402Contract, "PaymentAlreadyProcessed");
    });

    it("Should reject zero amount payments", async function () {
      const requestId = ethers.keccak256(ethers.toUtf8Bytes("test-request-3"));

      await expect(
        x402Contract.connect(payer).makePayment(recipient.address, 0, requestId)
      ).to.be.revertedWithCustomError(x402Contract, "InvalidAmount");
    });

    it("Should reject payments with insufficient balance", async function () {
      const amount = ethers.parseUnits("2000", 6); // More than payer has
      const requestId = ethers.keccak256(ethers.toUtf8Bytes("test-request-4"));

      await expect(
        x402Contract.connect(payer).makePayment(recipient.address, amount, requestId)
      ).to.be.revertedWithCustomError(x402Contract, "InsufficientBalance");
    });
  });

  describe("Payment Verification", function () {
    it("Should verify valid payment proofs", async function () {
      const amount = ethers.parseUnits("5", 6);
      const requestId = ethers.keccak256(ethers.toUtf8Bytes("test-request-5"));

      // Make payment
      await mockUSDC.connect(payer).approve(await x402Contract.getAddress(), amount);
      await x402Contract.connect(payer).makePayment(recipient.address, amount, requestId);

      // Verify payment
      const isValid = await x402Contract.verifyPayment(requestId, payer.address, amount);
      expect(isValid).to.be.true;
    });

    it("Should reject invalid payment proofs", async function () {
      const requestId = ethers.keccak256(ethers.toUtf8Bytes("non-existent-request"));
      
      const isValid = await x402Contract.verifyPayment(requestId, payer.address, ethers.parseUnits("1", 6));
      expect(isValid).to.be.false;
    });

    it("Should batch verify multiple payments", async function () {
      const amount = ethers.parseUnits("1", 6);
      const requestIds = [
        ethers.keccak256(ethers.toUtf8Bytes("batch-request-1")),
        ethers.keccak256(ethers.toUtf8Bytes("batch-request-2")),
        ethers.keccak256(ethers.toUtf8Bytes("batch-request-3"))
      ];

      // Approve and make payments
      await mockUSDC.connect(payer).approve(await x402Contract.getAddress(), amount * 3n);
      
      for (const requestId of requestIds) {
        await x402Contract.connect(payer).makePayment(recipient.address, amount, requestId);
      }

      // Batch verify
      const results = await x402Contract.batchVerifyPayments(requestIds);
      expect(results).to.deep.equal([true, true, true]);
    });
  });

  describe("Platform Fee", function () {
    it("Should allow owner to update platform fee", async function () {
      const newFee = 100; // 1%
      
      await expect(x402Contract.connect(owner).updatePlatformFee(newFee))
        .to.emit(x402Contract, "PlatformFeeUpdated")
        .withArgs(0, newFee);
    });

    it("Should reject non-owner from updating platform fee", async function () {
      const newFee = 100;
      
      await expect(
        x402Contract.connect(payer).updatePlatformFee(newFee)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should reject platform fee over 10%", async function () {
      const newFee = 1100; // 11%
      
      await expect(
        x402Contract.connect(owner).updatePlatformFee(newFee)
      ).to.be.revertedWithCustomError(x402Contract, "InvalidAmount");
    });

    it("Should deduct platform fee from payments", async function () {
      const platformFee = 100; // 1%
      const paymentAmount = ethers.parseUnits("100", 6); // 100 USDC
      const requestId = ethers.keccak256(ethers.toUtf8Bytes("fee-test-request"));

      // Set platform fee
      await x402Contract.connect(owner).updatePlatformFee(platformFee);

      // Approve and make payment
      await mockUSDC.connect(payer).approve(await x402Contract.getAddress(), paymentAmount);
      await x402Contract.connect(payer).makePayment(recipient.address, paymentAmount, requestId);

      // Check balances
      const recipientBalance = await mockUSDC.balanceOf(recipient.address);
      const ownerBalance = await mockUSDC.balanceOf(owner.address);
      
      expect(recipientBalance).to.equal(ethers.parseUnits("99", 6)); // 99 USDC (99%)
      expect(ownerBalance).to.equal(ethers.parseUnits("1", 6)); // 1 USDC (1% fee)
    });
  });

  describe("Statistics", function () {
    it("Should track payment statistics", async function () {
      const amount1 = ethers.parseUnits("10", 6);
      const amount2 = ethers.parseUnits("20", 6);
      const requestId1 = ethers.keccak256(ethers.toUtf8Bytes("stats-request-1"));
      const requestId2 = ethers.keccak256(ethers.toUtf8Bytes("stats-request-2"));

      // Make payments
      await mockUSDC.connect(payer).approve(await x402Contract.getAddress(), amount1 + amount2);
      await x402Contract.connect(payer).makePayment(recipient.address, amount1, requestId1);
      await x402Contract.connect(payer).makePayment(recipient.address, amount2, requestId2);

      // Check statistics
      const stats = await x402Contract.getPaymentStats(payer.address);
      expect(stats.totalPaid).to.equal(amount1 + amount2);
      
      const recipientStats = await x402Contract.getPaymentStats(recipient.address);
      expect(recipientStats.totalRequestsMade).to.equal(2);
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to emergency withdraw", async function () {
      // Send some tokens to contract
      await mockUSDC.mint(await x402Contract.getAddress(), ethers.parseUnits("100", 6));
      
      const contractBalance = await mockUSDC.balanceOf(await x402Contract.getAddress());
      expect(contractBalance).to.equal(ethers.parseUnits("100", 6));

      // Emergency withdraw
      await x402Contract.connect(owner).emergencyWithdraw(await mockUSDC.getAddress(), contractBalance);
      
      const ownerBalance = await mockUSDC.balanceOf(owner.address);
      expect(ownerBalance).to.equal(contractBalance);
    });

    it("Should reject non-owner from emergency withdraw", async function () {
      await expect(
        x402Contract.connect(payer).emergencyWithdraw(await mockUSDC.getAddress(), ethers.parseUnits("1", 6))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});

// Helper function to get latest block timestamp
async function time() {
  const block = await ethers.provider.getBlock('latest');
  return {
    latest: block.timestamp
  };
}
