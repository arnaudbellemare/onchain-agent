#!/usr/bin/env python3
"""
Quick Start Example: AI Agent with Cost Optimization
Copy and paste this code to get started in under 5 minutes!
"""

import requests
import json
from datetime import datetime

class CostOptimizedAIAgent:
    def __init__(self, api_key, base_url="https://your-domain.com/api/v1"):
        self.api_key = api_key
        self.base_url = base_url
        self.total_cost = 0
        self.total_saved = 0
        self.total_calls = 0
    
    def chat(self, message, max_cost=0.05):
        """
        Send a message to the AI and get an optimized response
        """
        response = requests.post(
            self.base_url,
            headers={
                "Content-Type": "application/json",
                "X-API-Key": self.api_key
            },
            json={
                "action": "optimize",
                "prompt": message,
                "maxCost": max_cost
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            if result['success']:
                # Track usage
                self.total_cost += result['data']['optimizedCost']
                self.total_saved += result['data']['savings']
                self.total_calls += 1
                
                return {
                    'message': result['data']['optimizedResponse'],
                    'cost': result['data']['optimizedCost'],
                    'saved': result['data']['savings'],
                    'provider': result['data']['recommendedProvider']
                }
        
        return {'error': 'Failed to get response'}
    
    def get_savings_report(self):
        """
        Get a summary of your cost savings
        """
        total_spent = self.total_cost + self.total_saved
        savings_percentage = (self.total_saved / total_spent * 100) if total_spent > 0 else 0
        
        return {
            'total_calls': self.total_calls,
            'total_cost': self.total_cost,
            'total_saved': self.total_saved,
            'savings_percentage': savings_percentage,
            'effective_cost': self.total_cost  # What you actually paid
        }
    
    def batch_process(self, messages, max_cost_per_message=0.03):
        """
        Process multiple messages efficiently
        """
        results = []
        for message in messages:
            result = self.chat(message, max_cost_per_message)
            results.append(result)
        return results

def main():
    # Step 1: Replace with your API key from /api-keys
    API_KEY = "oa_your_api_key_here"
    
    # Step 2: Create your AI agent
    agent = CostOptimizedAIAgent(API_KEY)
    
    # Step 3: Start chatting!
    print("🤖 AI Agent with Cost Optimization")
    print("=" * 40)
    
    # Example conversations
    messages = [
        "Explain quantum computing in simple terms",
        "Write a creative story about a robot learning to paint",
        "Help me debug this Python code: def factorial(n): return n * factorial(n-1) if n > 1 else 1"
    ]
    
    for i, message in enumerate(messages, 1):
        print(f"\n💬 Message {i}: {message}")
        
        result = agent.chat(message)
        
        if 'error' not in result:
            print(f"🤖 Response: {result['message'][:100]}...")
            print(f"💰 Cost: ${result['cost']:.4f}")
            print(f"💵 Saved: ${result['saved']:.4f}")
            print(f"🔧 Provider: {result['provider']}")
        else:
            print(f"❌ Error: {result['error']}")
    
    # Step 4: Check your savings!
    report = agent.get_savings_report()
    print("\n📊 Savings Report:")
    print("=" * 30)
    print(f"Total Calls: {report['total_calls']}")
    print(f"Total Cost: ${report['total_cost']:.4f}")
    print(f"Total Saved: ${report['total_saved']:.4f}")
    print(f"Savings: {report['savings_percentage']:.1f}%")
    print(f"Effective Cost: ${report['effective_cost']:.4f}")

if __name__ == "__main__":
    main()
