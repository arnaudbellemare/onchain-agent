# AI Agent Integration Guide

## 🚀 Quick Start Integration

### 1. Get Your API Key
```bash
# Visit your dashboard
curl -X POST "https://your-domain.com/api-keys" \
  -H "Content-Type: application/json" \
  -d '{"name": "My AI Agent"}'
```

### 2. Simple Integration (3 Lines of Code)

#### Python AI Agent Integration
```python
import requests

class AIAgentWithCostOptimization:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://your-domain.com/api/v1"
    
    def optimize_and_chat(self, prompt):
        # Single API call handles optimization + execution
        response = requests.post(
            f"{self.base_url}",
            headers={"X-API-Key": self.api_key},
            json={
                "action": "optimize",
                "prompt": prompt,
                "walletAddress": "0x..."  # Optional for micropayments
            }
        )
        
        result = response.json()
        if result['success']:
            return {
                'message': result['data']['optimizedResponse'],
                'cost': result['data']['optimizedCost'],
                'saved': result['data']['savings'],
                'provider': result['data']['recommendedProvider']
            }
        return None

# Usage
agent = AIAgentWithCostOptimization("oa_your_api_key_here")
response = agent.optimize_and_chat("Explain quantum computing")
print(f"Response: {response['message']}")
print(f"Cost: ${response['cost']:.4f}")
print(f"Saved: ${response['saved']:.4f}")
```

#### JavaScript/Node.js Integration
```javascript
class CostOptimizedAIAgent {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://your-domain.com/api/v1';
    }
    
    async optimizeAndChat(prompt) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.apiKey
            },
            body: JSON.stringify({
                action: 'optimize',
                prompt: prompt,
                walletAddress: '0x...' // Optional
            })
        });
        
        const result = await response.json();
        if (result.success) {
            return {
                message: result.data.optimizedResponse,
                cost: result.data.optimizedCost,
                saved: result.data.savings,
                provider: result.data.recommendedProvider
            };
        }
        return null;
    }
}

// Usage
const agent = new CostOptimizedAIAgent('oa_your_api_key_here');
agent.optimizeAndChat('Explain quantum computing')
    .then(response => {
        console.log('Response:', response.message);
        console.log('Cost:', `$${response.cost.toFixed(4)}`);
        console.log('Saved:', `$${response.saved.toFixed(4)}`);
    });
```

## 🏢 Enterprise Integration Examples

### 1. Customer Service Bot Integration

```python
class CustomerServiceBot:
    def __init__(self, api_key):
        self.api_key = api_key
        self.cost_tracker = CostTracker()
    
    def handle_customer_query(self, customer_message):
        # Optimize the prompt for cost efficiency
        optimized_response = self.optimize_prompt(customer_message)
        
        # Track costs
        self.cost_tracker.record_usage(
            cost=optimized_response['cost'],
            saved=optimized_response['saved'],
            provider=optimized_response['provider']
        )
        
        return optimized_response['message']
    
    def optimize_prompt(self, prompt):
        response = requests.post(
            "https://your-domain.com/api/v1",
            headers={"X-API-Key": self.api_key},
            json={
                "action": "optimize",
                "prompt": prompt,
                "maxCost": 0.01  # Limit cost per query
            }
        )
        return response.json()['data']

class CostTracker:
    def __init__(self):
        self.total_cost = 0
        self.total_saved = 0
        self.daily_queries = 0
    
    def record_usage(self, cost, saved, provider):
        self.total_cost += cost
        self.total_saved += saved
        self.daily_queries += 1
        
        # Log to your monitoring system
        self.log_to_monitoring({
            'cost': cost,
            'saved': saved,
            'provider': provider,
            'timestamp': datetime.now()
        })
    
    def get_daily_savings_report(self):
        return {
            'total_cost': self.total_cost,
            'total_saved': self.total_saved,
            'savings_percentage': (self.total_saved / (self.total_cost + self.total_saved)) * 100,
            'queries_processed': self.daily_queries
        }
```

### 2. Content Generation Pipeline

```python
class ContentGenerationPipeline:
    def __init__(self, api_key):
        self.api_key = api_key
        self.analytics = AnalyticsTracker()
    
    def generate_content_batch(self, content_requests):
        results = []
        total_cost = 0
        total_saved = 0
        
        for request in content_requests:
            # Optimize each content request
            optimized = self.optimize_content_request(request)
            
            results.append({
                'content': optimized['response'],
                'cost': optimized['cost'],
                'saved': optimized['saved'],
                'provider': optimized['provider']
            })
            
            total_cost += optimized['cost']
            total_saved += optimized['saved']
        
        # Generate analytics report
        self.analytics.generate_batch_report(results, total_cost, total_saved)
        
        return results
    
    def optimize_content_request(self, request):
        response = requests.post(
            "https://your-domain.com/api/v1",
            headers={"X-API-Key": self.api_key},
            json={
                "action": "optimize",
                "prompt": f"Generate {request['type']} about {request['topic']}",
                "provider": request.get('preferred_provider'),
                "maxCost": request.get('budget', 0.05)
            }
        )
        return response.json()['data']
```

### 3. Multi-Agent System Integration

```python
class MultiAgentSystem:
    def __init__(self, api_key):
        self.api_key = api_key
        self.agents = {
            'research': ResearchAgent(api_key),
            'writing': WritingAgent(api_key),
            'analysis': AnalysisAgent(api_key)
        }
        self.cost_monitor = CostMonitor()
    
    def execute_workflow(self, task):
        workflow_costs = []
        
        # Research phase
        research_result = self.agents['research'].process(task)
        workflow_costs.append(research_result['cost_data'])
        
        # Writing phase
        writing_result = self.agents['writing'].process(research_result['data'])
        workflow_costs.append(writing_result['cost_data'])
        
        # Analysis phase
        analysis_result = self.agents['analysis'].process(writing_result['data'])
        workflow_costs.append(analysis_result['cost_data'])
        
        # Calculate total savings
        total_cost = sum(cost['cost'] for cost in workflow_costs)
        total_saved = sum(cost['saved'] for cost in workflow_costs)
        
        self.cost_monitor.record_workflow({
            'task': task,
            'total_cost': total_cost,
            'total_saved': total_saved,
            'savings_percentage': (total_saved / (total_cost + total_saved)) * 100,
            'agents_used': len(workflow_costs)
        })
        
        return {
            'result': analysis_result['data'],
            'cost_summary': {
                'total_cost': total_cost,
                'total_saved': total_saved,
                'savings_percentage': (total_saved / (total_cost + total_saved)) * 100
            }
        }

class ResearchAgent:
    def __init__(self, api_key):
        self.api_key = api_key
    
    def process(self, task):
        response = requests.post(
            "https://your-domain.com/api/v1",
            headers={"X-API-Key": self.api_key},
            json={
                "action": "optimize",
                "prompt": f"Research and summarize: {task}",
                "maxCost": 0.02
            }
        )
        result = response.json()['data']
        return {
            'data': result['optimizedResponse'],
            'cost_data': {
                'cost': result['optimizedCost'],
                'saved': result['savings'],
                'provider': result['recommendedProvider']
            }
        }
```

## 📊 Real-Time Monitoring Integration

### 1. Dashboard Integration

```python
class RealTimeMonitor:
    def __init__(self, api_key):
        self.api_key = api_key
        self.monitoring_data = {}
    
    def get_live_analytics(self):
        response = requests.get(
            f"https://your-domain.com/api/v1/keys?action=analytics&keyId={self.get_key_id()}&timeframe=hour",
            headers={"X-API-Key": self.api_key}
        )
        return response.json()['data']
    
    def display_dashboard(self):
        analytics = self.get_live_analytics()
        
        print("🚀 Real-Time AI Cost Optimization Dashboard")
        print("=" * 50)
        print(f"📊 Total Calls: {analytics['summary']['totalCalls']}")
        print(f"💰 Total Cost: ${analytics['summary']['totalCost']:.4f}")
        print(f"💵 Total Saved: ${analytics['summary']['totalSaved']:.4f}")
        print(f"📈 Savings: {analytics['summary']['savingsPercentage']:.1f}%")
        print("\n🔧 Provider Breakdown:")
        
        for provider, stats in analytics['providerBreakdown'].items():
            print(f"  {provider}: {stats['calls']} calls, ${stats['cost']:.4f} cost, ${stats['saved']:.4f} saved")
        
        print(f"\n⏱️ Rate Limit: {analytics['rateLimit']['remaining']} requests remaining")
    
    def get_key_id(self):
        # Extract key ID from your API key management
        response = requests.get(
            "https://your-domain.com/api/v1/keys",
            headers={"X-API-Key": self.api_key}
        )
        keys = response.json()['data']['keys']
        return keys[0]['id'] if keys else None
```

### 2. Webhook Integration for Real-Time Updates

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

class WebhookMonitor:
    def __init__(self, api_key):
        self.api_key = api_key
        self.metrics = {
            'total_cost': 0,
            'total_saved': 0,
            'total_calls': 0,
            'alerts': []
        }
    
    @app.route('/webhook/cost-alert', methods=['POST'])
    def handle_cost_alert(self):
        data = request.json
        
        # Update metrics
        self.metrics['total_cost'] += data['cost']
        self.metrics['total_saved'] += data['saved']
        self.metrics['total_calls'] += 1
        
        # Check for alerts
        if data['cost'] > 0.05:  # Alert if single call exceeds $0.05
            self.metrics['alerts'].append({
                'type': 'high_cost',
                'cost': data['cost'],
                'timestamp': data['timestamp']
            })
        
        # Send to your monitoring system
        self.send_to_monitoring(data)
        
        return jsonify({'status': 'received'})
    
    def send_to_monitoring(self, data):
        # Send to your preferred monitoring service
        # Examples: Datadog, New Relic, CloudWatch, etc.
        pass
    
    def get_daily_report(self):
        return {
            'date': datetime.now().strftime('%Y-%m-%d'),
            'metrics': self.metrics,
            'savings_percentage': (self.metrics['total_saved'] / (self.metrics['total_cost'] + self.metrics['total_saved'])) * 100
        }

# Usage
monitor = WebhookMonitor("oa_your_api_key_here")
```

## 🎯 Business Integration Examples

### 1. E-commerce Customer Support

```python
class EcommerceSupportBot:
    def __init__(self, api_key):
        self.api_key = api_key
        self.cost_analyzer = CostAnalyzer()
    
    def handle_support_request(self, customer_message, order_id=None):
        # Optimize the support response
        optimized_response = self.optimize_support_response(customer_message, order_id)
        
        # Track business metrics
        self.cost_analyzer.record_support_interaction({
            'order_id': order_id,
            'cost': optimized_response['cost'],
            'saved': optimized_response['saved'],
            'response_time': optimized_response['response_time'],
            'customer_satisfaction': self.predict_satisfaction(optimized_response)
        })
        
        return optimized_response['message']
    
    def optimize_support_response(self, message, order_id):
        prompt = f"""
        Customer support request: {message}
        Order ID: {order_id}
        Provide helpful, concise support response.
        """
        
        response = requests.post(
            "https://your-domain.com/api/v1",
            headers={"X-API-Key": self.api_key},
            json={
                "action": "optimize",
                "prompt": prompt,
                "maxCost": 0.03,  # Budget per support interaction
                "provider": "anthropic"  # Prefer Claude for customer support
            }
        )
        return response.json()['data']
    
    def get_support_roi(self):
        return self.cost_analyzer.calculate_support_roi()

class CostAnalyzer:
    def __init__(self):
        self.interactions = []
    
    def record_support_interaction(self, data):
        self.interactions.append(data)
    
    def calculate_support_roi(self):
        total_cost = sum(i['cost'] for i in self.interactions)
        total_saved = sum(i['saved'] for i in self.interactions)
        
        # Calculate ROI based on reduced human support time
        human_support_cost = len(self.interactions) * 5.00  # $5 per human interaction
        ai_support_cost = total_cost
        
        roi = ((human_support_cost - ai_support_cost) / ai_support_cost) * 100
        
        return {
            'total_interactions': len(self.interactions),
            'ai_cost': ai_support_cost,
            'human_cost_saved': human_support_cost - ai_support_cost,
            'roi_percentage': roi,
            'cost_optimization_savings': total_saved
        }
```

### 2. Content Marketing Automation

```python
class ContentMarketingAutomation:
    def __init__(self, api_key):
        self.api_key = api_key
        self.content_metrics = ContentMetrics()
    
    def generate_content_campaign(self, campaign_brief):
        content_pieces = []
        total_budget = campaign_brief['budget']
        budget_used = 0
        
        for content_type in campaign_brief['content_types']:
            if budget_used >= total_budget:
                break
                
            # Generate optimized content
            content = self.generate_optimized_content(
                content_type, 
                campaign_brief['target_audience'],
                remaining_budget=total_budget - budget_used
            )
            
            content_pieces.append(content)
            budget_used += content['cost']
            
            # Track content performance
            self.content_metrics.track_content(content)
        
        return {
            'content_pieces': content_pieces,
            'budget_used': budget_used,
            'total_savings': sum(c['saved'] for c in content_pieces),
            'campaign_roi': self.content_metrics.calculate_campaign_roi(content_pieces)
        }
    
    def generate_optimized_content(self, content_type, audience, remaining_budget):
        prompt = f"""
        Create {content_type} for {audience}
        Focus on engagement and conversion
        """
        
        response = requests.post(
            "https://your-domain.com/api/v1",
            headers={"X-API-Key": self.api_key},
            json={
                "action": "optimize",
                "prompt": prompt,
                "maxCost": min(remaining_budget, 0.10),  # Max $0.10 per piece
                "provider": "openai"  # Prefer GPT for content generation
            }
        )
        
        result = response.json()['data']
        return {
            'content': result['optimizedResponse'],
            'cost': result['optimizedCost'],
            'saved': result['savings'],
            'provider': result['recommendedProvider'],
            'type': content_type
        }
```

## 📈 Monitoring and Analytics

### 1. Real-Time Cost Monitoring

```python
class RealTimeCostMonitor:
    def __init__(self, api_key):
        self.api_key = api_key
        self.dashboard_data = {}
    
    def get_live_dashboard_data(self):
        # Get real-time analytics from your API
        response = requests.get(
            f"https://your-domain.com/api/v1/keys?action=analytics&keyId={self.get_key_id()}",
            headers={"X-API-Key": self.api_key}
        )
        
        analytics = response.json()['data']
        
        return {
            'live_stats': {
                'current_hour_calls': analytics['summary']['totalCalls'],
                'current_hour_cost': analytics['summary']['totalCost'],
                'current_hour_saved': analytics['summary']['totalSaved'],
                'savings_rate': analytics['summary']['savingsPercentage']
            },
            'provider_breakdown': analytics['providerBreakdown'],
            'rate_limit_status': analytics['rateLimit'],
            'hourly_trend': analytics['hourlyBreakdown']
        }
    
    def display_live_dashboard(self):
        data = self.get_live_dashboard_data()
        
        print("🔄 Live AI Cost Optimization Dashboard")
        print("=" * 60)
        print(f"📊 Current Hour: {data['live_stats']['current_hour_calls']} calls")
        print(f"💰 Cost: ${data['live_stats']['current_hour_cost']:.4f}")
        print(f"💵 Saved: ${data['live_stats']['current_hour_saved']:.4f}")
        print(f"📈 Savings Rate: {data['live_stats']['savings_rate']:.1f}%")
        print(f"⏱️ Rate Limit: {data['rate_limit_status']['remaining']} remaining")
        
        print("\n🔧 Provider Performance:")
        for provider, stats in data['provider_breakdown'].items():
            print(f"  {provider}: {stats['calls']} calls, ${stats['cost']:.4f}, ${stats['saved']:.4f} saved")
        
        print("\n📊 Hourly Trend (Last 6 hours):")
        for hour_data in data['hourly_trend'][-6:]:
            print(f"  {hour_data['hour']:02d}:00 - {hour_data['calls']} calls, ${hour_data['cost']:.4f}, ${hour_data['saved']:.4f} saved")
```

### 2. Automated Reporting

```python
class AutomatedReporting:
    def __init__(self, api_key):
        self.api_key = api_key
    
    def generate_daily_report(self):
        # Get analytics for the last 24 hours
        response = requests.get(
            f"https://your-domain.com/api/v1/keys?action=analytics&keyId={self.get_key_id()}&timeframe=day",
            headers={"X-API-Key": self.api_key}
        )
        
        analytics = response.json()['data']
        
        report = {
            'date': datetime.now().strftime('%Y-%m-%d'),
            'summary': analytics['summary'],
            'provider_breakdown': analytics['providerBreakdown'],
            'recommendations': self.generate_recommendations(analytics)
        }
        
        # Send report via email/Slack/etc.
        self.send_report(report)
        
        return report
    
    def generate_recommendations(self, analytics):
        recommendations = []
        
        # Cost optimization recommendations
        if analytics['summary']['savingsPercentage'] < 20:
            recommendations.append({
                'type': 'optimization',
                'message': 'Consider using more cost-effective providers for simple tasks',
                'potential_savings': '15-30%'
            })
        
        # Provider recommendations
        provider_stats = analytics['providerBreakdown']
        if 'openai' in provider_stats and provider_stats['openai']['cost'] > 0.05:
            recommendations.append({
                'type': 'provider',
                'message': 'OpenAI costs are high - consider Anthropic for complex reasoning tasks',
                'potential_savings': '20-40%'
            })
        
        return recommendations
    
    def send_report(self, report):
        # Send to your preferred notification system
        # Examples: Email, Slack, Teams, etc.
        pass
```

## 🚀 Getting Started Checklist

### For Individual Developers:
- [ ] Get API key from `/api-keys`
- [ ] Test with simple integration example
- [ ] Set up cost monitoring
- [ ] Integrate into your AI agent
- [ ] Monitor savings dashboard

### For Companies:
- [ ] Generate multiple API keys for different teams
- [ ] Set up enterprise monitoring dashboard
- [ ] Implement cost tracking in your systems
- [ ] Set up automated reporting
- [ ] Train teams on optimization best practices

### For Enterprise:
- [ ] Set up dedicated API keys per department
- [ ] Implement comprehensive monitoring
- [ ] Set up alerts for cost thresholds
- [ ] Create custom dashboards
- [ ] Establish cost optimization policies

## 💡 Best Practices

1. **Start Small**: Begin with simple integrations and scale up
2. **Monitor Closely**: Use the real-time dashboard to track performance
3. **Set Budgets**: Use `maxCost` parameter to control spending
4. **Optimize Providers**: Let the system choose the best provider for each task
5. **Track ROI**: Measure actual business impact of cost savings
6. **Automate Reporting**: Set up daily/weekly cost reports
7. **Security First**: Keep API keys secure and rotate regularly

## 🔗 Quick Links

- **API Documentation**: `/api-docs`
- **Generate API Key**: `/api-keys`
- **Analytics Dashboard**: `/dashboard`
- **Developer Resources**: `/developer`

Your AI agents can now be cost-optimized with just a few lines of code! 🚀
