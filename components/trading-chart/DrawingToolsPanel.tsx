"use client";
import React from 'react';
import { DrawingToolType } from './drawingTools/types';

interface Props {
  activeTool: DrawingToolType | null;
  onToolSelect: (tool: DrawingToolType | null) => void;
  onClearAll: () => void;
  onClose: () => void;
  docked?: boolean;
}

const tools: { key: DrawingToolType; label: string; icon: string; category: string }[] = [
  { key: 'trendline', label: 'Trend Line', icon: '📈', category: 'Lines' },
  { key: 'horizontal', label: 'Horizontal', icon: '➖', category: 'Lines' },
  { key: 'vertical', label: 'Vertical', icon: '📏', category: 'Lines' },
  { key: 'rectangle', label: 'Rectangle', icon: '▭', category: 'Shapes' },
  { key: 'fibonacci', label: 'Fibonacci', icon: '🌀', category: 'Analysis' },
  { key: 'arrow', label: 'Arrow', icon: '➡️', category: 'Annotations' },
  { key: 'text', label: 'Text', icon: '📝', category: 'Annotations' },
  { key: 'brush', label: 'Brush', icon: '🖌️', category: 'Drawing' },
  { key: 'eraser', label: 'Eraser', icon: '🗑️', category: 'Tools' },
];

const categories = ['Lines', 'Shapes', 'Analysis', 'Annotations', 'Drawing', 'Tools'];

export default function DrawingToolsPanel({ activeTool, onToolSelect, onClearAll, onClose, docked = false }: Props) {
  const containerStyle: React.CSSProperties = docked ? {
    position: 'relative',
    left: 'auto',
    top: 'auto',
    bottom: 'auto',
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderRadius: 12,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'none',
  } : {
    position: 'fixed',
    right: 12,
    top: 60,
    bottom: 60,
    width: 340,
    background: 'linear-gradient(135deg, #0f1220 0%, #1a1d2e 100%)',
    border: '1px solid #243042',
    borderRadius: 16,
    zIndex: 12,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(59, 130, 246, 0.1)',
    backdropFilter: 'blur(10px)'
  };
  return (
    <div style={containerStyle}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #243042',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(90deg, #1f2937 0%, #374151 100%)',
        borderRadius: docked ? 12 : '16px 16px 0 0'
      }}>
        <div style={{
          fontWeight: 700,
          fontSize: 16,
          color: '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          🎨 Drawing Tools
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            color: '#9ca3af',
            border: 'none',
            cursor: 'pointer',
            fontSize: 18,
            padding: 4,
            borderRadius: 6,
            transition: 'all 0.2s ease'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
        {categories.map(category => {
          const categoryTools = tools.filter(t => t.category === category);
          if (categoryTools.length === 0) return null;

          return (
            <div key={category} style={{ marginBottom: 24 }}>
              <div style={{
                color: '#9ca3af',
                fontSize: 11,
                fontWeight: 600,
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {category}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                gap: 8
              }}>
                {categoryTools.map(tool => (
                  <button
                    key={tool.key}
                    onClick={() => onToolSelect(activeTool === tool.key ? null : tool.key)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      padding: '14px 8px',
                      background: activeTool === tool.key
                        ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                        : 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
                      color: '#e5e7eb',
                      border: `1px solid ${activeTool === tool.key ? '#60a5fa' : '#374151'}`,
                      borderRadius: 12,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontSize: 12,
                      textAlign: 'center',
                      boxShadow: activeTool === tool.key
                        ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                        : '0 2px 8px rgba(0,0,0,0.2)',
                      transform: activeTool === tool.key ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    <span style={{ fontSize: 20, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>
                      {tool.icon}
                    </span>
                    <span style={{ fontWeight: 500, lineHeight: 1.2 }}>{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        <div style={{ borderTop: '1px solid #243042', paddingTop: 16, marginTop: 16 }}>
          <button
            onClick={onClearAll}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: '#fff',
              border: '1px solid #b91c1c',
              padding: '12px 16px',
              borderRadius: 12,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
            }}
          >
            🗑️ Clear All Drawings
          </button>
        </div>

        {activeTool && (
          <div style={{
            marginTop: 16,
            padding: 12,
            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
            borderRadius: 12,
            border: '1px solid #4b5563',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              fontSize: 12,
              color: '#10b981',
              fontWeight: 600,
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span style={{ fontSize: 14 }}>🎯</span>
              Active Tool: {tools.find(t => t.key === activeTool)?.label}
            </div>
            <div style={{
              fontSize: 11,
              color: '#6b7280',
              lineHeight: 1.4
            }}>
              Click and drag on the chart to draw. Right-click or press ESC to cancel.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}