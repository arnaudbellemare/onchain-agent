"use client";

import { useState } from "react";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { type: string; amount: string; token?: string; recipient?: string; fromToken?: string; toToken?: string; slippage?: number; message?: string }) => void;
  type: "send" | "swap" | "request";
  asset?: {
    symbol: string;
    name: string;
    balance: string;
    value: string;
    change24h: string;
    change24hPercent: string;
  } | null;
}

export default function TransactionModal({ isOpen, onClose, onConfirm, type, asset }: TransactionModalProps) {
  const [formData, setFormData] = useState({
    amount: "",
    recipient: "",
    toToken: "USDC",
    slippage: "0.5",
    message: ""
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === "send") {
      if (!formData.amount || !formData.recipient) {
        alert("Please fill in all fields");
        return;
      }
      if (!formData.recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
        alert("Please enter a valid Ethereum address");
        return;
      }
      onConfirm({
        type: "send",
        amount: formData.amount,
        recipient: formData.recipient,
        token: asset?.symbol || "ETH"
      });
    } else if (type === "swap") {
      if (!formData.amount || !formData.toToken) {
        alert("Please fill in all fields");
        return;
      }
      onConfirm({
        type: "swap",
        amount: formData.amount,
        fromToken: asset?.symbol || "ETH",
        toToken: formData.toToken,
        slippage: parseFloat(formData.slippage)
      });
    } else if (type === "request") {
      if (!formData.amount || !formData.recipient) {
        alert("Please fill in all fields");
        return;
      }
      onConfirm({
        type: "request",
        amount: formData.amount,
        recipient: formData.recipient,
        token: asset?.symbol || "ETH",
        message: formData.message
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            {type === "send" ? `Send ${asset?.symbol}` : 
             type === "swap" ? `Swap ${asset?.symbol}` : 
             `Request ${asset?.symbol}`}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "send" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  placeholder="0x..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount ({asset?.symbol})
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Available: {asset?.balance} {asset?.symbol}
                </p>
              </div>
            </>
          ) : type === "request" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Request From Address
                </label>
                <input
                  type="text"
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  placeholder="0x..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount ({asset?.symbol})
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message (Optional)
                </label>
                <input
                  type="text"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="What is this payment for?"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  From Token
                </label>
                <div className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                  {asset?.symbol} - {asset?.name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount ({asset?.symbol})
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Available: {asset?.balance} {asset?.symbol}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  To Token
                </label>
                <select
                  value={formData.toToken}
                  onChange={(e) => setFormData({ ...formData, toToken: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USDC">USDC</option>
                  <option value="ETH">ETH</option>
                  <option value="BTC">BTC</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Slippage Tolerance (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.slippage}
                  onChange={(e) => setFormData({ ...formData, slippage: e.target.value })}
                  placeholder="0.5"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {type === "send" ? "Send" : type === "swap" ? "Swap" : "Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
