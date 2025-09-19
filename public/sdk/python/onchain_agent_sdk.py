"""
OnChain Agent SDK - Python
Easy integration for AI agent cost optimization

Installation:
pip install requests

Usage:
from onchain_agent_sdk import AIAgentClient
"""

import requests
import json
from typing import Optional, Dict, Any


class AIAgentClient:
    """
    Python client for OnChain Agent API
    
    Provides easy integration with AI agent cost optimization
    and x402 micropayment protocol.
    """
    
    def __init__(self, api_key: str, base_url: str = "https://your-domain.com/api/v1", timeout: int = 30):
        """
        Initialize the client
        
        Args:
            api_key: Your API key
            base_url: Base URL for the API
            timeout: Request timeout in seconds
        """
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'X-API-Key': api_key
        })
    
    def _make_request(self, endpoint: str, method: str = 'GET', data: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Make authenticated API request
        
        Args:
            endpoint: API endpoint
            method: HTTP method
            data: Request data
            
        Returns:
            API response data
            
        Raises:
            requests.RequestException: If request fails
            ValueError: If response contains error
        """
        url = f"{self.base_url}{endpoint}" if not endpoint.startswith('http') else endpoint
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, timeout=self.timeout)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, timeout=self.timeout)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            response.raise_for_status()
            result = response.json()
            
            if not result.get('success', False):
                raise ValueError(result.get('error', 'Unknown API error'))
            
            return result
            
        except requests.exceptions.Timeout:
            raise requests.RequestException("Request timeout: API did not respond in time")
        except requests.exceptions.ConnectionError:
            raise requests.RequestException("Connection error: Unable to connect to API")
        except requests.exceptions.HTTPError as e:
            try:
                error_data = e.response.json()
                error_msg = error_data.get('error', f"HTTP {e.response.status_code}")
            except:
                error_msg = f"HTTP {e.response.status_code}: {e.response.reason}"
            raise ValueError(error_msg)
    
    def optimize(self, prompt: str, wallet_address: str, provider: Optional[str] = None, max_cost: Optional[float] = None) -> Dict[str, Any]:
        """
        Optimize AI agent costs using x402 protocol
        
        Args:
            prompt: Your AI prompt
            wallet_address: Your wallet address for micropayments
            provider: AI provider (openai, anthropic, perplexity)
            max_cost: Maximum cost in USD
            
        Returns:
            Optimization result with savings information
            
        Raises:
            ValueError: If required parameters are missing or API returns error
        """
        if not prompt:
            raise ValueError("prompt is required")
        if not wallet_address:
            raise ValueError("wallet_address is required")
        
        data = {
            'action': 'optimize',
            'prompt': prompt,
            'walletAddress': wallet_address
        }
        
        if provider:
            data['provider'] = provider
        if max_cost is not None:
            data['maxCost'] = max_cost
        
        return self._make_request('', 'POST', data)
    
    def chat(self, message: str, wallet_address: str) -> Dict[str, Any]:
        """
        Chat with AI through cost-optimized routing
        
        Args:
            message: Your message
            wallet_address: Your wallet address
            
        Returns:
            Chat response with cost information
            
        Raises:
            ValueError: If required parameters are missing or API returns error
        """
        if not message:
            raise ValueError("message is required")
        if not wallet_address:
            raise ValueError("wallet_address is required")
        
        data = {
            'action': 'chat',
            'message': message,
            'walletAddress': wallet_address
        }
        
        return self._make_request('', 'POST', data)
    
    def connect_wallet(self, wallet_address: str, signature: Optional[str] = None) -> Dict[str, Any]:
        """
        Connect wallet for micropayments
        
        Args:
            wallet_address: Your wallet address
            signature: Wallet signature for verification
            
        Returns:
            Wallet connection result
            
        Raises:
            ValueError: If required parameters are missing or API returns error
        """
        if not wallet_address:
            raise ValueError("wallet_address is required")
        
        data = {
            'action': 'wallet',
            'walletAddress': wallet_address
        }
        
        if signature:
            data['signature'] = signature
        
        return self._make_request('', 'POST', data)
    
    def get_analytics(self, wallet_address: str) -> Dict[str, Any]:
        """
        Get cost analytics and savings reports
        
        Args:
            wallet_address: Your wallet address
            
        Returns:
            Analytics data including savings and usage statistics
            
        Raises:
            ValueError: If required parameters are missing or API returns error
        """
        if not wallet_address:
            raise ValueError("wallet_address is required")
        
        endpoint = f"?action=analytics&walletAddress={requests.utils.quote(wallet_address)}"
        return self._make_request(endpoint)
    
    def get_providers(self) -> Dict[str, Any]:
        """
        Get available AI providers and pricing information
        
        Returns:
            Provider information including models and pricing
            
        Raises:
            ValueError: If API returns error
        """
        return self._make_request('?action=providers')
    
    def get_info(self) -> Dict[str, Any]:
        """
        Get API information and available endpoints
        
        Returns:
            API information and documentation
            
        Raises:
            ValueError: If API returns error
        """
        return self._make_request('?action=info')


# Convenience functions for quick usage
def optimize_costs(api_key: str, prompt: str, wallet_address: str, provider: Optional[str] = None, max_cost: Optional[float] = None, **kwargs) -> Dict[str, Any]:
    """
    Quick function to optimize AI costs
    
    Args:
        api_key: Your API key
        prompt: Your AI prompt
        wallet_address: Your wallet address
        provider: AI provider (optional)
        max_cost: Maximum cost in USD (optional)
        **kwargs: Additional client options
        
    Returns:
        Optimization result
    """
    client = AIAgentClient(api_key, **kwargs)
    return client.optimize(prompt, wallet_address, provider, max_cost)


def chat_with_ai(api_key: str, message: str, wallet_address: str, **kwargs) -> Dict[str, Any]:
    """
    Quick function to chat with AI
    
    Args:
        api_key: Your API key
        message: Your message
        wallet_address: Your wallet address
        **kwargs: Additional client options
        
    Returns:
        Chat response
    """
    client = AIAgentClient(api_key, **kwargs)
    return client.chat(message, wallet_address)


def get_analytics(api_key: str, wallet_address: str, **kwargs) -> Dict[str, Any]:
    """
    Quick function to get analytics
    
    Args:
        api_key: Your API key
        wallet_address: Your wallet address
        **kwargs: Additional client options
        
    Returns:
        Analytics data
    """
    client = AIAgentClient(api_key, **kwargs)
    return client.get_analytics(wallet_address)


# Example usage
if __name__ == "__main__":
    # Example 1: Using the class
    client = AIAgentClient(
        api_key="your-api-key",
        base_url="https://your-domain.com/api/v1"
    )
    
    try:
        # Optimize costs
        result = client.optimize(
            prompt="Explain quantum computing in simple terms",
            wallet_address="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
            provider="openai",
            max_cost=0.10
        )
        
        print(f"Savings: {result['data']['savingsPercentage']:.1f}%")
        print(f"Response: {result['data']['response']}")
        
        # Chat with AI
        chat_result = client.chat(
            message="Hello! How can you help me save money on AI costs?",
            wallet_address="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
        )
        
        print(f"AI Response: {chat_result['data']['message']}")
        print(f"Cost: ${chat_result['data']['cost']:.4f}")
        
        # Get analytics
        analytics = client.get_analytics("0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6")
        print(f"Total Savings: ${analytics['data']['totalSaved']:.2f}")
        
    except ValueError as e:
        print(f"API Error: {e}")
    except requests.RequestException as e:
        print(f"Network Error: {e}")
    
    # Example 2: Using convenience functions
    try:
        quick_result = optimize_costs(
            api_key="your-api-key",
            prompt="What is machine learning?",
            wallet_address="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
            provider="anthropic",
            max_cost=0.05
        )
        
        print(f"Quick optimization savings: {quick_result['data']['savingsPercentage']:.1f}%")
        
    except (ValueError, requests.RequestException) as e:
        print(f"Error: {e}")
