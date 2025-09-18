// Real-time Provider Price Monitoring Service
import { x402APIWrapper } from './x402APIWrapper';

interface PriceUpdate {
  providerId: string;
  providerName: string;
  oldCost: number;
  newCost: number;
  changePercentage: number;
  timestamp: Date;
}

interface ProviderPrice {
  providerId: string;
  providerName: string;
  currentCost: number;
  previousCost: number;
  changePercentage: number;
  lastUpdated: Date;
  trend: 'up' | 'down' | 'stable';
}

interface PriceAlert {
  id: string;
  providerId: string;
  threshold: number;
  condition: 'above' | 'below';
  triggered: boolean;
  timestamp?: Date;
}

export class PriceMonitor {
  private priceHistory: Map<string, number[]> = new Map();
  private priceAlerts: PriceAlert[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring: boolean = false;
  private priceUpdateCallbacks: ((update: PriceUpdate) => void)[] = [];

  constructor() {
    this.initializePriceHistory();
  }

  // Start real-time price monitoring
  startMonitoring(intervalMs: number = 30000) { // Default: 30 seconds
    if (this.isMonitoring) {
      console.log('Price monitoring already running');
      return;
    }

    this.isMonitoring = true;
    console.log(`Starting price monitoring with ${intervalMs}ms interval`);

    this.monitoringInterval = setInterval(async () => {
      await this.checkAllProviderPrices();
    }, intervalMs);

    // Initial price check
    this.checkAllProviderPrices();
  }

  // Stop price monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('Price monitoring stopped');
  }

  // Check prices for all providers
  private async checkAllProviderPrices() {
    const providers = x402APIWrapper.getProviders();
    
    for (const provider of providers) {
      try {
        await this.checkProviderPrice(provider.id);
      } catch (error) {
        console.error(`Failed to check price for ${provider.name}:`, error);
      }
    }
  }

  // Check price for specific provider
  private async checkProviderPrice(providerId: string) {
    try {
      // Get current provider info
      const providers = x402APIWrapper.getProviders();
      const provider = providers.find(p => p.id === providerId);
      
      if (!provider) {
        console.error(`Provider ${providerId} not found`);
        return;
      }

      // In a real implementation, you would:
      // 1. Make API calls to provider pricing endpoints
      // 2. Parse pricing data
      // 3. Update costs accordingly
      
      // For now, we'll simulate price changes
      const newCost = this.simulatePriceChange(provider.cost);
      const oldCost = provider.cost;
      
      if (Math.abs(newCost - oldCost) > 0.001) { // Only update if significant change
        // Update provider cost
        x402APIWrapper.updateProviderCost(providerId, newCost);
        
        // Record price history
        this.recordPriceHistory(providerId, newCost);
        
        // Calculate change percentage
        const changePercentage = ((newCost - oldCost) / oldCost) * 100;
        
        // Create price update
        const priceUpdate: PriceUpdate = {
          providerId,
          providerName: provider.name,
          oldCost,
          newCost,
          changePercentage,
          timestamp: new Date()
        };
        
        // Notify callbacks
        this.notifyPriceUpdate(priceUpdate);
        
        // Check alerts
        this.checkPriceAlerts(priceUpdate);
        
        console.log(`Price update for ${provider.name}: $${oldCost} → $${newCost} (${changePercentage.toFixed(2)}%)`);
      }
      
    } catch (error) {
      console.error(`Error checking price for ${providerId}:`, error);
    }
  }

  // Simulate price changes (replace with real API calls)
  private simulatePriceChange(currentCost: number): number {
    // Simulate realistic price fluctuations (±5%)
    const changePercent = (Math.random() - 0.5) * 0.1; // -5% to +5%
    const newCost = currentCost * (1 + changePercent);
    
    // Ensure minimum cost
    return Math.max(newCost, 0.001);
  }

  // Record price history
  private recordPriceHistory(providerId: string, cost: number) {
    if (!this.priceHistory.has(providerId)) {
      this.priceHistory.set(providerId, []);
    }
    
    const history = this.priceHistory.get(providerId)!;
    history.push(cost);
    
    // Keep only last 100 price points
    if (history.length > 100) {
      history.shift();
    }
  }

  // Initialize price history
  private initializePriceHistory() {
    const providers = x402APIWrapper.getProviders();
    providers.forEach(provider => {
      this.priceHistory.set(provider.id, [provider.cost]);
    });
  }

  // Notify price update callbacks
  private notifyPriceUpdate(update: PriceUpdate) {
    this.priceUpdateCallbacks.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error in price update callback:', error);
      }
    });
  }

  // Add price update callback
  onPriceUpdate(callback: (update: PriceUpdate) => void) {
    this.priceUpdateCallbacks.push(callback);
  }

  // Remove price update callback
  removePriceUpdateCallback(callback: (update: PriceUpdate) => void) {
    const index = this.priceUpdateCallbacks.indexOf(callback);
    if (index > -1) {
      this.priceUpdateCallbacks.splice(index, 1);
    }
  }

  // Create price alert
  createPriceAlert(providerId: string, threshold: number, condition: 'above' | 'below'): string {
    const alert: PriceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      providerId,
      threshold,
      condition,
      triggered: false
    };
    
    this.priceAlerts.push(alert);
    console.log(`Created price alert: ${providerId} ${condition} $${threshold}`);
    
    return alert.id;
  }

  // Check price alerts
  private checkPriceAlerts(priceUpdate: PriceUpdate) {
    const relevantAlerts = this.priceAlerts.filter(
      alert => alert.providerId === priceUpdate.providerId && !alert.triggered
    );
    
    relevantAlerts.forEach(alert => {
      const shouldTrigger = 
        (alert.condition === 'above' && priceUpdate.newCost > alert.threshold) ||
        (alert.condition === 'below' && priceUpdate.newCost < alert.threshold);
      
      if (shouldTrigger) {
        alert.triggered = true;
        alert.timestamp = new Date();
        
        console.log(`🚨 PRICE ALERT TRIGGERED: ${priceUpdate.providerName} is now $${priceUpdate.newCost} (${alert.condition} $${alert.threshold})`);
        
        // In a real implementation, you would:
        // - Send email/SMS notifications
        // - Trigger automated actions
        // - Update user dashboards
      }
    });
  }

  // Get current provider prices
  getCurrentPrices(): ProviderPrice[] {
    const providers = x402APIWrapper.getProviders();
    
    return providers.map(provider => {
      const history = this.priceHistory.get(provider.id) || [provider.cost];
      const previousCost = history.length > 1 ? history[history.length - 2] : provider.cost;
      const changePercentage = ((provider.cost - previousCost) / previousCost) * 100;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (changePercentage > 1) trend = 'up';
      else if (changePercentage < -1) trend = 'down';
      
      return {
        providerId: provider.id,
        providerName: provider.name,
        currentCost: provider.cost,
        previousCost,
        changePercentage,
        lastUpdated: new Date(),
        trend
      };
    });
  }

  // Get price history for provider
  getPriceHistory(providerId: string): number[] {
    return this.priceHistory.get(providerId) || [];
  }

  // Get active alerts
  getActiveAlerts(): PriceAlert[] {
    return this.priceAlerts.filter(alert => !alert.triggered);
  }

  // Get triggered alerts
  getTriggeredAlerts(): PriceAlert[] {
    return this.priceAlerts.filter(alert => alert.triggered);
  }

  // Remove alert
  removeAlert(alertId: string): boolean {
    const index = this.priceAlerts.findIndex(alert => alert.id === alertId);
    if (index > -1) {
      this.priceAlerts.splice(index, 1);
      return true;
    }
    return false;
  }

  // Get monitoring status
  getMonitoringStatus(): { isMonitoring: boolean; interval?: number } {
    return {
      isMonitoring: this.isMonitoring,
      interval: this.monitoringInterval ? 30000 : undefined
    };
  }
}

// Export singleton instance
export const priceMonitor = new PriceMonitor();
