// AI-Powered Fraud Detection System
export interface FraudRisk {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
  reasons: string[];
  recommendations: string[];
  autoBlock: boolean;
}

export interface TransactionPattern {
  amount: number;
  frequency: number;
  timeOfDay: number;
  dayOfWeek: number;
  recipientPattern: string;
  descriptionPattern: string;
  location?: string;
  deviceFingerprint?: string;
}

export interface UserBehaviorProfile {
  userId: string;
  averageTransactionAmount: number;
  typicalTransactionTimes: number[];
  commonRecipients: string[];
  spendingCategories: string[];
  riskScore: number;
  lastUpdated: Date;
}

export class FraudDetectionEngine {
  private userProfiles: Map<string, UserBehaviorProfile> = new Map();
  private suspiciousPatterns: TransactionPattern[] = [];
  private blockedAddresses: Set<string> = new Set();
  private whitelistedAddresses: Set<string> = new Set();

  constructor() {
    this.initializeSuspiciousPatterns();
    this.initializeBlockedAddresses();
  }

  // Main fraud detection method
  async detectFraud(
    transaction: {
      amount: number;
      recipientAddress: string;
      description: string;
      timestamp: Date;
      userId: string;
      deviceFingerprint?: string;
      location?: string;
    }
  ): Promise<FraudRisk> {
    const riskFactors: string[] = [];
    const recommendations: string[] = [];
    let riskScore = 0;

    // 1. Amount-based risk assessment
    const amountRisk = this.assessAmountRisk(transaction.amount, transaction.userId);
    if (amountRisk.score > 0) {
      riskScore += amountRisk.score;
      riskFactors.push(...amountRisk.reasons);
    }

    // 2. Recipient address risk
    const recipientRisk = this.assessRecipientRisk(transaction.recipientAddress);
    if (recipientRisk.score > 0) {
      riskScore += recipientRisk.score;
      riskFactors.push(...recipientRisk.reasons);
    }

    // 3. Behavioral pattern analysis
    const behaviorRisk = await this.assessBehavioralRisk(transaction);
    if (behaviorRisk.score > 0) {
      riskScore += behaviorRisk.score;
      riskFactors.push(...behaviorRisk.reasons);
    }

    // 4. Time-based risk analysis
    const timeRisk = this.assessTimeRisk(transaction.timestamp, transaction.userId);
    if (timeRisk.score > 0) {
      riskScore += timeRisk.score;
      riskFactors.push(...timeRisk.reasons);
    }

    // 5. Device and location analysis
    const deviceRisk = this.assessDeviceRisk(transaction.deviceFingerprint, transaction.location, transaction.userId);
    if (deviceRisk.score > 0) {
      riskScore += deviceRisk.score;
      riskFactors.push(...deviceRisk.reasons);
    }

    // 6. Pattern matching against known fraud patterns
    const patternRisk = this.assessPatternRisk(transaction);
    if (patternRisk.score > 0) {
      riskScore += patternRisk.score;
      riskFactors.push(...patternRisk.reasons);
    }

    // Determine risk level and recommendations
    const riskLevel = this.determineRiskLevel(riskScore);
    const autoBlock = riskLevel === 'critical' || riskScore > 80;

    if (riskLevel === 'high' || riskLevel === 'critical') {
      recommendations.push('Require additional verification');
      recommendations.push('Notify security team');
    }

    if (riskLevel === 'medium') {
      recommendations.push('Monitor transaction closely');
      recommendations.push('Consider additional verification');
    }

    if (autoBlock) {
      recommendations.push('Block transaction automatically');
    }

    return {
      level: riskLevel,
      score: Math.min(riskScore, 100),
      reasons: riskFactors,
      recommendations,
      autoBlock
    };
  }

  // Amount-based risk assessment
  private assessAmountRisk(amount: number, userId: string): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    const userProfile = this.userProfiles.get(userId);
    const averageAmount = userProfile?.averageTransactionAmount || 1000;

    // Large amount relative to user's typical spending
    if (amount > averageAmount * 5) {
      score += 30;
      reasons.push(`Amount ($${amount.toLocaleString()}) is 5x higher than typical spending ($${averageAmount.toLocaleString()})`);
    }

    // Very large absolute amounts
    if (amount > 100000) {
      score += 25;
      reasons.push(`Very large transaction amount: $${amount.toLocaleString()}`);
    }

    // Round number amounts (potential fraud indicator)
    if (amount % 10000 === 0 && amount > 10000) {
      score += 10;
      reasons.push('Round number amount may indicate fraudulent transaction');
    }

    return { score, reasons };
  }

  // Recipient address risk assessment
  private assessRecipientRisk(recipientAddress: string): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Check if address is blocked
    if (this.blockedAddresses.has(recipientAddress.toLowerCase())) {
      score += 100;
      reasons.push('Recipient address is on blocked list');
    }

    // Check if address is whitelisted (reduces risk)
    if (this.whitelistedAddresses.has(recipientAddress.toLowerCase())) {
      score -= 20;
      reasons.push('Recipient address is whitelisted');
    }

    // Check for suspicious address patterns
    if (this.isSuspiciousAddress(recipientAddress)) {
      score += 20;
      reasons.push('Recipient address matches suspicious pattern');
    }

    return { score, reasons };
  }

  // Behavioral risk assessment
  private async assessBehavioralRisk(transaction: any): Promise<{ score: number; reasons: string[] }> {
    const reasons: string[] = [];
    let score = 0;

    const userProfile = this.userProfiles.get(transaction.userId);
    if (!userProfile) {
      // New user - moderate risk
      score += 15;
      reasons.push('New user with no transaction history');
      return { score, reasons };
    }

    // Unusual transaction time
    const transactionHour = transaction.timestamp.getHours();
    const typicalHours = userProfile.typicalTransactionTimes;
    if (!typicalHours.includes(transactionHour)) {
      score += 20;
      reasons.push(`Transaction at unusual time: ${transactionHour}:00 (typical: ${typicalHours.join(', ')})`);
    }

    // New recipient
    if (!userProfile.commonRecipients.includes(transaction.recipientAddress)) {
      score += 15;
      reasons.push('Transaction to new recipient address');
    }

    // High frequency transactions
    const recentTransactions = this.getRecentTransactions(transaction.userId, 24); // Last 24 hours
    if (recentTransactions.length > 10) {
      score += 25;
      reasons.push(`High transaction frequency: ${recentTransactions.length} transactions in 24 hours`);
    }

    return { score, reasons };
  }

  // Time-based risk assessment
  private assessTimeRisk(timestamp: Date, userId: string): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    const hour = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();

    // Transactions outside business hours
    if (hour < 6 || hour > 22) {
      score += 15;
      reasons.push(`Transaction outside typical business hours: ${hour}:00`);
    }

    // Weekend transactions (higher risk)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      score += 10;
      reasons.push('Weekend transaction');
    }

    // Very early morning transactions
    if (hour >= 2 && hour <= 5) {
      score += 20;
      reasons.push('Very early morning transaction (2-5 AM)');
    }

    return { score, reasons };
  }

  // Device and location risk assessment
  private assessDeviceRisk(deviceFingerprint?: string, location?: string, userId?: string): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    if (!deviceFingerprint) {
      score += 10;
      reasons.push('No device fingerprint available');
    }

    if (!location) {
      score += 5;
      reasons.push('No location data available');
    }

    // Check for device changes
    if (userId && deviceFingerprint) {
      const userProfile = this.userProfiles.get(userId);
      if (userProfile && userProfile.lastUpdated) {
        // This would normally check against stored device fingerprints
        // For now, we'll simulate this check
        const isNewDevice = Math.random() < 0.1; // 10% chance of new device
        if (isNewDevice) {
          score += 15;
          reasons.push('Transaction from new device');
        }
      }
    }

    return { score, reasons };
  }

  // Pattern-based risk assessment
  private assessPatternRisk(transaction: any): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Check against known fraud patterns
    for (const pattern of this.suspiciousPatterns) {
      if (this.matchesPattern(transaction, pattern)) {
        score += 30;
        reasons.push(`Transaction matches known fraud pattern: ${pattern.descriptionPattern}`);
      }
    }

    // Check for rapid-fire transactions
    const recentTransactions = this.getRecentTransactions(transaction.userId, 1); // Last hour
    if (recentTransactions.length > 5) {
      score += 25;
      reasons.push('Rapid-fire transactions detected');
    }

    return { score, reasons };
  }

  // Helper methods
  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  private isSuspiciousAddress(address: string): boolean {
    // Check for common fraud patterns in addresses
    const suspiciousPatterns = [
      /^0x0000/, // Addresses starting with zeros
      /^0xffff/, // Addresses starting with f's
      /(.)\1{10,}/, // Repeated characters
    ];

    return suspiciousPatterns.some(pattern => pattern.test(address));
  }

  private matchesPattern(transaction: any, pattern: TransactionPattern): boolean {
    // Simplified pattern matching
    return (
      transaction.amount >= pattern.amount * 0.8 &&
      transaction.amount <= pattern.amount * 1.2 &&
      transaction.timestamp.getHours() === pattern.timeOfDay
    );
  }

  private getRecentTransactions(userId: string, hours: number): any[] {
    // This would normally query the database
    // For now, return mock data
    return [];
  }

  private initializeSuspiciousPatterns(): void {
    this.suspiciousPatterns = [
      {
        amount: 10000,
        frequency: 1,
        timeOfDay: 3,
        dayOfWeek: 0,
        recipientPattern: '0x',
        descriptionPattern: 'urgent payment'
      },
      {
        amount: 50000,
        frequency: 1,
        timeOfDay: 23,
        dayOfWeek: 6,
        recipientPattern: '0x',
        descriptionPattern: 'emergency'
      }
    ];
  }

  private initializeBlockedAddresses(): void {
    // Initialize with known fraudulent addresses
    this.blockedAddresses.add('0x0000000000000000000000000000000000000000');
    this.blockedAddresses.add('0xffffffffffffffffffffffffffffffffffffffff');
  }

  // Update user behavior profile
  updateUserProfile(userId: string, transaction: any): void {
    const existingProfile = this.userProfiles.get(userId);
    
    if (existingProfile) {
      // Update existing profile
      existingProfile.averageTransactionAmount = 
        (existingProfile.averageTransactionAmount + transaction.amount) / 2;
      
      if (!existingProfile.commonRecipients.includes(transaction.recipientAddress)) {
        existingProfile.commonRecipients.push(transaction.recipientAddress);
      }
      
      existingProfile.lastUpdated = new Date();
    } else {
      // Create new profile
      this.userProfiles.set(userId, {
        userId,
        averageTransactionAmount: transaction.amount,
        typicalTransactionTimes: [transaction.timestamp.getHours()],
        commonRecipients: [transaction.recipientAddress],
        spendingCategories: [],
        riskScore: 0,
        lastUpdated: new Date()
      });
    }
  }

  // Get fraud detection statistics
  getFraudStats(): {
    totalTransactions: number;
    blockedTransactions: number;
    highRiskTransactions: number;
    averageRiskScore: number;
  } {
    // This would normally query the database
    return {
      totalTransactions: 1250,
      blockedTransactions: 23,
      highRiskTransactions: 45,
      averageRiskScore: 15.2
    };
  }
}

// Export singleton instance
export const fraudDetectionEngine = new FraudDetectionEngine();
