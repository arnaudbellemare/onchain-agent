"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: message }],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResponse(data.message);
      } else {
        setResponse(`Error: ${data.error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🤖 Coinbase AgentKit
            </h1>
            <p className="text-lg text-gray-600">
              Your AI assistant with crypto wallet capabilities
            </p>
            <div className="mt-4 px-4 py-2 bg-green-100 text-green-800 rounded-full inline-block">
              Powered by Perplexity AI
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me to check your wallet balance, send tokens, or interact with smart contracts..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Processing..." : "Send"}
              </button>
            </div>
          </form>

          {response && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Agent Response:
              </h3>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-gray-700 font-mono text-sm">
                  {response}
                </pre>
              </div>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">💳 Wallet Operations</h4>
              <p className="text-blue-700 text-sm">
                Check balances, send tokens, and manage your crypto wallet
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">🔗 Smart Contracts</h4>
              <p className="text-green-700 text-sm">
                Interact with DeFi protocols and smart contracts
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">🌐 Web3 Integration</h4>
              <p className="text-purple-700 text-sm">
                Access blockchain data and perform on-chain operations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}