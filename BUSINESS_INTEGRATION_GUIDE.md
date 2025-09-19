# Business Integration Guide

## 🏢 How Companies Integrate AI Cost Optimization

### Quick Start (5 minutes)
```python
import requests

API_KEY = "oa_your_api_key_here"

def optimize_ai_call(prompt):
    response = requests.post(
        "https://your-domain.com/api/v1",
        headers={"X-API-Key": API_KEY},
        json={"action": "optimize", "prompt": prompt}
    )
    return response.json()

# Usage
result = optimize_ai_call("Write a product description")
print(f"Cost: ${result['data']['optimizedCost']:.4f}")
print(f"Saved: ${result['data']['savings']:.4f}")
```

## 📊 Real-Time Monitoring

### Embedded Widget
```html
<div id="ai-cost-widget"></div>
<script>
new AnalyticsWidget({
    apiKey: 'oa_your_api_key_here',
    keyId: 'your_key_id_here'
});
</script>
```

### Live Analytics API
```python
def get_analytics(api_key, key_id):
    response = requests.get(
        f"https://your-domain.com/api/v1/keys?action=analytics&keyId={key_id}",
        headers={"X-API-Key": api_key}
    )
    return response.json()['data']

analytics = get_analytics("oa_your_api_key_here", "your_key_id_here")
print(f"Total saved: ${analytics['summary']['totalSaved']:.2f}")
```

## 🎯 Business Benefits

- **30-50% cost reduction** on AI API calls
- **Real-time monitoring** prevents budget overruns
- **Automatic provider selection** for optimal cost/quality
- **Multiple API keys** for different teams

## 🚀 Getting Started

1. **Get API Key**: Visit `/api-keys`
2. **Test Integration**: Use copy-paste examples
3. **Monitor Dashboard**: Check `/dashboard`
4. **Scale Up**: Add more complex integrations

## 📞 Resources

- **API Docs**: `/api-docs`
- **Dashboard**: `/dashboard`
- **API Keys**: `/api-keys`