'use client';

import React, { useState, useEffect } from 'react';

interface CycleNode {
  id: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  color: string;
  isActive: boolean;
  savings: number;
  speed: number;
}

interface Connection {
  from: string;
  to: string;
  isActive: boolean;
  speed: number;
}

export default function AnimatedOptimizationBackground() {
  const [nodes, setNodes] = useState<CycleNode[]>([
    {
      id: 'access',
      title: 'Access Service',
      icon: '🔗',
      x: 20,
      y: 50,
      color: 'blue',
      isActive: false,
      savings: 0,
      speed: 0
    },
    {
      id: 'payment',
      title: 'x402 Payment',
      icon: '₿',
      x: 40,
      y: 20,
      color: 'green',
      isActive: false,
      savings: 0,
      speed: 0
    },
    {
      id: 'decision',
      title: 'Make Decision',
      icon: '🧠',
      x: 60,
      y: 30,
      color: 'purple',
      isActive: false,
      savings: 0,
      speed: 0
    },
    {
      id: 'check',
      title: 'Check Price',
      icon: '🔍',
      x: 80,
      y: 60,
      color: 'orange',
      isActive: false,
      savings: 0,
      speed: 0
    },
    {
      id: 'discover',
      title: 'Discover Service',
      icon: '✨',
      x: 60,
      y: 80,
      color: 'pink',
      isActive: false,
      savings: 0,
      speed: 0
    },
    {
      id: 'optimize',
      title: 'Optimize Loop',
      icon: '🔄',
      x: 40,
      y: 70,
      color: 'red',
      isActive: false,
      savings: 0,
      speed: 0
    },
    {
      id: 'track',
      title: 'Track Cost',
      icon: '📊',
      x: 20,
      y: 40,
      color: 'teal',
      isActive: false,
      savings: 0,
      speed: 0
    }
  ]);

  const [connections, setConnections] = useState<Connection[]>([
    { from: 'access', to: 'payment', isActive: false, speed: 0 },
    { from: 'payment', to: 'decision', isActive: false, speed: 0 },
    { from: 'decision', to: 'check', isActive: false, speed: 0 },
    { from: 'check', to: 'discover', isActive: false, speed: 0 },
    { from: 'discover', to: 'optimize', isActive: false, speed: 0 },
    { from: 'optimize', to: 'track', isActive: false, speed: 0 },
    { from: 'track', to: 'access', isActive: false, speed: 0 }
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prevNodes => {
        const newNodes = [...prevNodes];
        
        // Reset all nodes
        newNodes.forEach(node => {
          node.isActive = false;
          node.savings = 0;
          node.speed = 0;
        });

        // Activate current step
        if (newNodes[currentStep]) {
          newNodes[currentStep].isActive = true;
          newNodes[currentStep].savings = Math.random() * 50 + 10; // $10-60 savings
          newNodes[currentStep].speed = Math.random() * 100 + 50; // 50-150ms speed
        }

        return newNodes;
      });

      setConnections(prevConnections => {
        const newConnections = [...prevConnections];
        
        // Reset all connections
        newConnections.forEach(conn => {
          conn.isActive = false;
          conn.speed = 0;
        });

        // Activate current connection
        if (newConnections[currentStep]) {
          newConnections[currentStep].isActive = true;
          newConnections[currentStep].speed = Math.random() * 200 + 100; // 100-300ms speed
        }

        return newConnections;
      });

      // Update metrics
      setTotalSavings(prev => prev + Math.random() * 25 + 5);
      setCyclesCompleted(prev => prev + 1);

      // Move to next step
      setCurrentStep(prev => (prev + 1) % nodes.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [currentStep, nodes.length]);

  const getNodeColor = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive ? 'bg-blue-500 shadow-blue-500/50' : 'bg-blue-200',
      green: isActive ? 'bg-green-500 shadow-green-500/50' : 'bg-green-200',
      purple: isActive ? 'bg-purple-500 shadow-purple-500/50' : 'bg-purple-200',
      orange: isActive ? 'bg-orange-500 shadow-orange-500/50' : 'bg-orange-200',
      pink: isActive ? 'bg-pink-500 shadow-pink-500/50' : 'bg-pink-200',
      red: isActive ? 'bg-red-500 shadow-red-500/50' : 'bg-red-200',
      teal: isActive ? 'bg-teal-500 shadow-teal-500/50' : 'bg-teal-200'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-200';
  };

  const getConnectionColor = (isActive: boolean) => {
    return isActive ? 'stroke-blue-400' : 'stroke-gray-300';
  };

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50 opacity-30"></div>
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-24 h-24 bg-green-200 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-32 w-28 h-28 bg-purple-200 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-32 right-10 w-20 h-20 bg-orange-200 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* SVG for the optimization cycle */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {/* Connections */}
        {connections.map((connection, index) => {
          const fromNode = nodes.find(n => n.id === connection.from);
          const toNode = nodes.find(n => n.id === connection.to);
          
          if (!fromNode || !toNode) return null;

          return (
            <line
              key={index}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              strokeWidth="0.5"
              className={`${getConnectionColor(connection.isActive)} transition-all duration-500 ${
                connection.isActive ? 'drop-shadow-sm' : ''
              }`}
              strokeDasharray={connection.isActive ? "2,1" : "1,2"}
              style={{
                animation: connection.isActive ? 'dash 1s linear infinite' : 'none'
              }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <g key={node.id}>
            {/* Node circle */}
            <circle
              cx={node.x}
              cy={node.y}
              r="3"
              className={`${getNodeColor(node.color, node.isActive)} transition-all duration-500 ${
                node.isActive ? 'shadow-lg animate-pulse' : ''
              }`}
            />
            
            {/* Node label */}
            <text
              x={node.x}
              y={node.y - 5}
              textAnchor="middle"
              className={`text-xs font-medium transition-all duration-500 ${
                node.isActive ? 'text-gray-900 font-bold' : 'text-gray-600'
              }`}
            >
              {node.title}
            </text>

            {/* Savings indicator */}
            {node.isActive && node.savings > 0 && (
              <text
                x={node.x}
                y={node.y + 6}
                textAnchor="middle"
                className="text-xs font-bold text-green-600 animate-bounce"
              >
                ${node.savings.toFixed(0)}
              </text>
            )}

            {/* Speed indicator */}
            {node.isActive && node.speed > 0 && (
              <text
                x={node.x}
                y={node.y + 8}
                textAnchor="middle"
                className="text-xs font-medium text-blue-600"
              >
                {node.speed.toFixed(0)}ms
              </text>
            )}
          </g>
        ))}

        {/* Floating savings particles */}
        {nodes.map((node) => 
          node.isActive && Array.from({ length: 3 }).map((_, i) => (
            <circle
              key={`${node.id}-particle-${i}`}
              cx={node.x + (Math.random() - 0.5) * 4}
              cy={node.y + (Math.random() - 0.5) * 4}
              r="0.3"
              className="fill-green-400 animate-ping"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '2s'
              }}
            />
          ))
        )}
      </svg>

      {/* Live metrics overlay */}
      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <div className="text-sm font-medium text-gray-900 mb-2">Live Optimization</div>
        <div className="space-y-1 text-xs text-gray-600">
          <div>Total Savings: <span className="font-bold text-green-600">${totalSavings.toFixed(2)}</span></div>
          <div>Cycles: <span className="font-bold text-blue-600">{cyclesCompleted}</span></div>
          <div>Status: <span className="font-bold text-green-600">Active</span></div>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -3;
          }
        }
      `}</style>
    </div>
  );
}
