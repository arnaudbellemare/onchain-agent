// Intelligent Approval Workflows and Automated Decision Making
export interface ApprovalRule {
  id: string;
  name: string;
  conditions: ApprovalCondition[];
  actions: ApprovalAction[];
  priority: number;
  enabled: boolean;
}

export interface ApprovalCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: unknown;
  logicalOperator?: 'AND' | 'OR';
}

export interface ApprovalAction {
  type: 'auto_approve' | 'auto_reject' | 'require_approval' | 'escalate' | 'notify';
  parameters: Record<string, unknown>;
}

export interface ApprovalRequest {
  id: string;
  transactionId: string;
  amount: number;
  recipientAddress: string;
  description: string;
  requesterId: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  approverId?: string;
  approvalChain: string[];
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
}

export interface ApprovalChain {
  id: string;
  name: string;
  steps: ApprovalStep[];
  autoEscalationMinutes: number;
  enabled: boolean;
  priority: number;
}

export interface ApprovalStep {
  id: string;
  name: string;
  approverType: 'user' | 'role' | 'ai' | 'multi_sig';
  approverId?: string;
  role?: string;
  requiredApprovals: number;
  timeoutMinutes: number;
  conditions?: ApprovalCondition[];
}

export class ApprovalWorkflowEngine {
  private approvalRules: ApprovalRule[] = [];
  private approvalChains: ApprovalChain[] = [];
  private pendingRequests: Map<string, ApprovalRequest> = new Map();
  private approvalHistory: ApprovalRequest[] = [];

  constructor() {
    this.initializeDefaultRules();
    this.initializeDefaultChains();
  }

  // Main approval processing method
  async processApprovalRequest(
    transaction: {
      id: string;
      amount: number;
      recipientAddress: string;
      description: string;
      requesterId: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<{
    requiresApproval: boolean;
    approvalRequestId?: string;
    autoApproved: boolean;
    reason: string;
  }> {
    // 1. Check if transaction matches any auto-approval rules
    const autoApprovalRule = this.findMatchingRule(transaction, 'auto_approve');
    if (autoApprovalRule) {
      return {
        requiresApproval: false,
        autoApproved: true,
        reason: `Auto-approved by rule: ${autoApprovalRule.name}`
      };
    }

    // 2. Check if transaction matches any auto-rejection rules
    const autoRejectionRule = this.findMatchingRule(transaction, 'auto_reject');
    if (autoRejectionRule) {
      return {
        requiresApproval: false,
        autoApproved: false,
        reason: `Auto-rejected by rule: ${autoRejectionRule.name}`
      };
    }

    // 3. Determine approval chain based on transaction characteristics
    const approvalChain = this.determineApprovalChain(transaction);
    
    if (!approvalChain) {
      return {
        requiresApproval: false,
        autoApproved: true,
        reason: 'No approval chain required for this transaction type'
      };
    }

    // 4. Create approval request
    const approvalRequest: ApprovalRequest = {
      id: `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transactionId: transaction.id,
      amount: transaction.amount,
      recipientAddress: transaction.recipientAddress,
      description: transaction.description,
      requesterId: transaction.requesterId,
      status: 'pending',
      approvalChain: approvalChain.steps.map(step => step.id),
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: transaction.metadata || {}
    };

    this.pendingRequests.set(approvalRequest.id, approvalRequest);

    // 5. Start approval process
    await this.startApprovalProcess(approvalRequest, approvalChain);

    return {
      requiresApproval: true,
      approvalRequestId: approvalRequest.id,
      autoApproved: false,
      reason: `Approval required: ${approvalChain.name}`
    };
  }

  // Find matching approval rule
  private findMatchingRule(transaction: unknown, actionType: string): ApprovalRule | null {
    for (const rule of this.approvalRules) {
      if (!rule.enabled) continue;
      
      const matchingAction = rule.actions.find(action => action.type === actionType);
      if (!matchingAction) continue;

      if (this.evaluateConditions(rule.conditions, transaction)) {
        return rule;
      }
    }
    return null;
  }

  // Evaluate approval conditions
  private evaluateConditions(conditions: ApprovalCondition[], transaction: unknown): boolean {
    if (conditions.length === 0) return true;

    let result = this.evaluateCondition(conditions[0], transaction);
    
    for (let i = 1; i < conditions.length; i++) {
      const condition = conditions[i];
      const conditionResult = this.evaluateCondition(condition, transaction);
      
      if (condition.logicalOperator === 'OR') {
        result = result || conditionResult;
      } else {
        result = result && conditionResult;
      }
    }
    
    return result;
  }

  // Evaluate single condition
  private evaluateCondition(condition: ApprovalCondition, transaction: unknown): boolean {
    const fieldValue = this.getFieldValue(transaction, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      default:
        return false;
    }
  }

  // Get field value from transaction
  private getFieldValue(transaction: unknown, field: string): unknown {
    const fieldParts = field.split('.');
    let value: unknown = transaction;
    
    for (const part of fieldParts) {
      value = (value as Record<string, unknown>)?.[part];
    }
    
    return value;
  }

  // Determine appropriate approval chain
  private determineApprovalChain(transaction: unknown): ApprovalChain | null {
    // Sort chains by priority (higher number = higher priority)
    const sortedChains = [...this.approvalChains]
      .filter(chain => chain.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const chain of sortedChains) {
      // Check if transaction matches chain conditions
      if (this.transactionMatchesChain(transaction, chain)) {
        return chain;
      }
    }

    return null;
  }

  // Check if transaction matches approval chain
  private transactionMatchesChain(transaction: unknown, chain: ApprovalChain): boolean {
    // This is a simplified matching logic
    // In a real system, this would be more sophisticated
    
    // Example: High-value transactions require executive approval
    if ((transaction as {amount: number}).amount > 100000 && chain.name.includes('Executive')) {
      return true;
    }
    
    // Example: New vendor payments require manager approval
    if ((transaction as {description: string}).description.toLowerCase().includes('new vendor') && chain.name.includes('Manager')) {
      return true;
    }
    
    // Example: International payments require compliance approval
    if ((transaction as {recipientAddress: string}).recipientAddress.startsWith('0x') && chain.name.includes('Compliance')) {
      return true;
    }
    
    return false;
  }

  // Start approval process
  private async startApprovalProcess(approvalRequest: ApprovalRequest, chain: ApprovalChain): Promise<void> {
    console.log(`🔄 Starting approval process for transaction ${approvalRequest.transactionId}`);
    
    // Notify first approver in the chain
    const firstStep = chain.steps[0];
    if (firstStep) {
      await this.notifyApprover(approvalRequest, firstStep);
      
      // Set timeout for auto-escalation
      setTimeout(() => {
        this.handleApprovalTimeout(approvalRequest.id, firstStep.id);
      }, firstStep.timeoutMinutes * 60 * 1000);
    }
  }

  // Notify approver
  private async notifyApprover(approvalRequest: ApprovalRequest, step: ApprovalStep): Promise<void> {
    console.log(`📧 Notifying approver for step: ${step.name}`);
    
    // In a real system, this would send actual notifications
    // For now, we'll simulate the notification
    const notification = {
      type: 'approval_request',
      approvalRequestId: approvalRequest.id,
      transactionId: approvalRequest.transactionId,
      amount: approvalRequest.amount,
      description: approvalRequest.description,
      stepName: step.name,
      timeoutMinutes: step.timeoutMinutes
    };
    
    console.log('Notification sent:', notification);
  }

  // Handle approval timeout
  private handleApprovalTimeout(approvalRequestId: string, stepId: string): void {
    const approvalRequest = this.pendingRequests.get(approvalRequestId);
    if (!approvalRequest || approvalRequest.status !== 'pending') return;
    
    console.log(`⏰ Approval timeout for request ${approvalRequestId}, step ${stepId}`);
    
    // Auto-escalate to next step or mark as escalated
    approvalRequest.status = 'escalated';
    approvalRequest.updatedAt = new Date();
    
    this.approvalHistory.push(approvalRequest);
    this.pendingRequests.delete(approvalRequestId);
  }

  // Process approval decision
  async processApprovalDecision(
    approvalRequestId: string,
    decision: 'approve' | 'reject',
    approverId: string,
    comments?: string
  ): Promise<{ success: boolean; message: string }> {
    const approvalRequest = this.pendingRequests.get(approvalRequestId);
    
    if (!approvalRequest) {
      return { success: false, message: 'Approval request not found' };
    }
    
    if (approvalRequest.status !== 'pending') {
      return { success: false, message: 'Approval request is no longer pending' };
    }
    
    // Update approval request
    approvalRequest.status = decision === 'approve' ? 'approved' : 'rejected';
    approvalRequest.approverId = approverId;
    approvalRequest.updatedAt = new Date();
    
    if (comments) {
      approvalRequest.metadata.comments = comments;
    }
    
    // Move to history
    this.approvalHistory.push(approvalRequest);
    this.pendingRequests.delete(approvalRequestId);
    
    console.log(`✅ Approval decision processed: ${decision} by ${approverId}`);
    
    return {
      success: true,
      message: `Transaction ${decision}d successfully`
    };
  }

  // Get pending approvals for a user
  getPendingApprovals(userId: string): ApprovalRequest[] {
    return Array.from(this.pendingRequests.values())
      .filter(request => request.status === 'pending');
  }

  // Get approval statistics
  getApprovalStats(): {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    averageApprovalTime: number;
  } {
    const total = this.approvalHistory.length + this.pendingRequests.size;
    const approved = this.approvalHistory.filter(r => r.status === 'approved').length;
    const rejected = this.approvalHistory.filter(r => r.status === 'rejected').length;
    const pending = this.pendingRequests.size;
    
    // Calculate average approval time
    const completedRequests = this.approvalHistory.filter(r => r.status !== 'pending');
    const totalTime = completedRequests.reduce((sum, r) => {
      return sum + (r.updatedAt.getTime() - r.createdAt.getTime());
    }, 0);
    const averageTime = completedRequests.length > 0 ? totalTime / completedRequests.length : 0;
    
    return {
      totalRequests: total,
      pendingRequests: pending,
      approvedRequests: approved,
      rejectedRequests: rejected,
      averageApprovalTime: averageTime / (1000 * 60) // Convert to minutes
    };
  }

  // Initialize default approval rules
  private initializeDefaultRules(): void {
    this.approvalRules = [
      {
        id: 'auto_approve_small_amounts',
        name: 'Auto-approve small amounts',
        conditions: [
          { field: 'amount', operator: 'less_than', value: 1000 }
        ],
        actions: [
          { type: 'auto_approve', parameters: {} }
        ],
        priority: 1,
        enabled: true
      },
      {
        id: 'auto_approve_whitelisted_vendors',
        name: 'Auto-approve whitelisted vendors',
        conditions: [
          { field: 'recipientAddress', operator: 'in', value: [
            '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            '0x8ba1f109551bD432803012645Hac136c'
          ]}
        ],
        actions: [
          { type: 'auto_approve', parameters: {} }
        ],
        priority: 2,
        enabled: true
      },
      {
        id: 'auto_reject_suspicious_patterns',
        name: 'Auto-reject suspicious patterns',
        conditions: [
          { field: 'description', operator: 'contains', value: 'urgent payment' },
          { field: 'amount', operator: 'greater_than', value: 50000 }
        ],
        actions: [
          { type: 'auto_reject', parameters: { reason: 'Suspicious pattern detected' } }
        ],
        priority: 3,
        enabled: true
      }
    ];
  }

  // Initialize default approval chains
  private initializeDefaultChains(): void {
    this.approvalChains = [
      {
        id: 'standard_approval',
        name: 'Standard Approval Chain',
        steps: [
          {
            id: 'manager_approval',
            name: 'Manager Approval',
            approverType: 'role',
            role: 'manager',
            requiredApprovals: 1,
            timeoutMinutes: 60
          }
        ],
        autoEscalationMinutes: 120,
        enabled: true,
        priority: 1
      },
      {
        id: 'executive_approval',
        name: 'Executive Approval Chain',
        steps: [
          {
            id: 'manager_approval',
            name: 'Manager Approval',
            approverType: 'role',
            role: 'manager',
            requiredApprovals: 1,
            timeoutMinutes: 30
          },
          {
            id: 'executive_approval',
            name: 'Executive Approval',
            approverType: 'role',
            role: 'executive',
            requiredApprovals: 1,
            timeoutMinutes: 60
          }
        ],
        autoEscalationMinutes: 180,
        enabled: true,
        priority: 3
      },
      {
        id: 'compliance_approval',
        name: 'Compliance Approval Chain',
        steps: [
          {
            id: 'compliance_review',
            name: 'Compliance Review',
            approverType: 'role',
            role: 'compliance',
            requiredApprovals: 1,
            timeoutMinutes: 120
          }
        ],
        autoEscalationMinutes: 240,
        enabled: true,
        priority: 2
      }
    ];
  }
}

// Export singleton instance
export const approvalWorkflowEngine = new ApprovalWorkflowEngine();
