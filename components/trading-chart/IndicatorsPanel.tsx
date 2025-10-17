"use client";
import React, { useState } from 'react';
import { IndicatorKey } from './indicators/types';

interface Props {
  active: IndicatorKey[];
  onAdd: (key: IndicatorKey) => void;
  onRemove: (key: IndicatorKey) => void;
  onClear: () => void;
  onClose: () => void;
  onColorChange?: (key: IndicatorKey, colors: string[]) => void;
  docked?: boolean;
}

const items: { key: IndicatorKey; label: string; defaultColors: string[] }[] = [
  { key: 'alligator', label: 'Alligator', defaultColors: ['#13FF00', '#FF0000', '#0000FF'] },
  { key: 'bb', label: 'Bollinger Bands', defaultColors: ['#FF6B00', '#FF6B00', '#FF6B00'] },
  { key: 'envelopes', label: 'Envelopes', defaultColors: ['#FF6B00', '#FF6B00'] },
  { key: 'fractal', label: 'Fractal', defaultColors: ['#00FF00'] },
  { key: 'ichimoku', label: 'Ichimoku Cloud', defaultColors: ['#FF0000', '#0000FF', '#00FF00', '#800080', '#FFA500'] },
  { key: 'keltner', label: 'Keltner channel', defaultColors: ['#FF6B00', '#FF6B00', '#FF6B00'] },
  { key: 'donchian', label: 'Donchian channel', defaultColors: ['#FF6B00', '#FF6B00', '#FF6B00'] },
  { key: 'supertrend', label: 'Supertrend', defaultColors: ['#00FF00', '#FF0000'] },
  { key: 'sma', label: 'Moving Average', defaultColors: ['#FF6B00'] },
  { key: 'psar', label: 'Parabolic SAR', defaultColors: ['#00FF00'] },
  { key: 'zigzag', label: 'Zig Zag', defaultColors: ['#FF0000'] },
  { key: 'volume', label: 'Volume', defaultColors: ['#808080'] },
];

const colorPalette = [
  '#13FF00', '#FF0000', '#0000FF', '#FF6B00', '#00FFFF', '#FF00FF', '#FFFF00', '#800080',
  '#FFA500', '#008000', '#000080', '#800000', '#808000', '#808080', '#C0C0C0', '#FFFFFF'
];

export default function IndicatorsPanel({ active, onAdd, onRemove, onClear, onClose, onColorChange, docked = false }: Props) {
  const [editingColors, setEditingColors] = useState<IndicatorKey | null>(null);
  const [tempColors, setTempColors] = useState<{ [key: string]: string[] }>({});
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
    boxShadow: 'none'
  } : {
    position:'fixed', left:12, top:60, bottom:60, width:280, background:'#0f1220f2', border:'1px solid #243042', borderRadius:12, zIndex: 80, display:'flex', flexDirection:'column', boxShadow:'0 12px 30px #0008'
  };
  return (
    <div style={containerStyle}>
      <div style={{ padding:'10px 12px', borderBottom:'1px solid #243042', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontWeight:600 }}>Indicators</div>
        <button onClick={onClose} style={{ background:'transparent', color:'#9ca3af', border:'none', cursor:'pointer' }}>✕</button>
      </div>
      <div style={{ padding:12, overflowY:'auto', flex: 1 }}>
        <div style={{ color:'#9ca3af', fontSize:12, marginBottom:8 }}>TREND INDICATORS</div>
        {items.map(item => {
          const isActive = active.includes(item.key);
          const isEditing = editingColors === item.key;
          const currentColors = tempColors[item.key] || item.defaultColors;
          
          return (
            <div key={item.key} style={{ marginBottom:12, background: isActive ? '#1a1f2e' : 'transparent', padding: 8, borderRadius: 6, border: isActive ? '1px solid #374151' : '1px solid transparent' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom: isActive ? 8 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div>{item.label}</div>
                  {isActive && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      {currentColors.map((color, idx) => (
                        <div key={idx} style={{ 
                          width: 16, 
                          height: 16, 
                          backgroundColor: color, 
                          borderRadius: 3, 
                          border: '1px solid #374151',
                          cursor: 'pointer'
                        }} onClick={() => {
                          setEditingColors(item.key);
                          setTempColors(prev => ({ ...prev, [item.key]: [...currentColors] }));
                        }} />
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {isActive ? (
                    <>
                      <button onClick={() => {
                        setEditingColors(item.key);
                        setTempColors(prev => ({ ...prev, [item.key]: [...currentColors] }));
                      }} style={{ 
                        background:'#374151', 
                        color:'#e5e7eb', 
                        border:'1px solid #4b5563', 
                        padding:'2px 6px', 
                        borderRadius:4, 
                        cursor:'pointer',
                        fontSize: 11
                      }}>Edit</button>
                      <button onClick={() => onRemove(item.key)} style={{ 
                        background:'#7f1d1d', 
                        color:'#e5e7eb', 
                        border:'1px solid #b91c1c', 
                        padding:'2px 6px', 
                        borderRadius:4, 
                        cursor:'pointer',
                        fontSize: 11
                      }}>Remove</button>
                    </>
                  ) : (
                    <button onClick={() => onAdd(item.key)} style={{ 
                      background:'#059669', 
                      color:'#e5e7eb', 
                      border:'1px solid #10b981', 
                      padding:'4px 8px', 
                      borderRadius:6, 
                      cursor:'pointer' 
                    }}>Add</button>
                  )}
                </div>
              </div>
              
              {/* Color Editor */}
              {isEditing && (
                <div style={{ 
                  marginTop: 8, 
                  padding: 8, 
                  background: '#111827', 
                  borderRadius: 6,
                  border: '1px solid #374151'
                }}>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Colors:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                    {currentColors.map((color, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <div style={{ 
                          width: 24, 
                          height: 24, 
                          backgroundColor: color, 
                          borderRadius: 4, 
                          border: '2px solid #374151',
                          cursor: 'pointer'
                        }} />
                        <div style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', marginTop: 2 }}>
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>Palette:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 3, marginBottom: 8 }}>
                    {colorPalette.map((color, idx) => (
                      <div key={idx} style={{ 
                        width: 20, 
                        height: 20, 
                        backgroundColor: color, 
                        borderRadius: 3, 
                        border: '1px solid #374151',
                        cursor: 'pointer'
                      }} onClick={() => {
                        // Replace first color for now - could be enhanced to select which line
                        const newColors = [...currentColors];
                        newColors[0] = color;
                        setTempColors(prev => ({ ...prev, [item.key]: newColors }));
                      }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button onClick={() => setEditingColors(null)} style={{ 
                      background:'#374151', 
                      color:'#e5e7eb', 
                      border:'1px solid #4b5563', 
                      padding:'4px 8px', 
                      borderRadius:4, 
                      cursor:'pointer',
                      fontSize: 11
                    }}>Cancel</button>
                    <button onClick={() => {
                      if (onColorChange) {
                        onColorChange(item.key, currentColors);
                      }
                      setEditingColors(null);
                    }} style={{ 
                      background:'#059669', 
                      color:'#e5e7eb', 
                      border:'1px solid #10b981', 
                      padding:'4px 8px', 
                      borderRadius:4, 
                      cursor:'pointer',
                      fontSize: 11
                    }}>Apply</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Sticky footer with Clear All */}
      <div style={{ padding:10, borderTop:'1px solid #243042' }}>
        <button
          onClick={onClear}
          disabled={active.length === 0}
          style={{
            width:'100%',
            background: active.length === 0 ? '#374151' : '#7f1d1d',
            color:'#fff',
            border:'1px solid ' + (active.length === 0 ? '#4b5563' : '#b91c1c'),
            padding:'6px 10px',
            borderRadius:8,
            cursor: active.length === 0 ? 'not-allowed' : 'pointer',
            opacity: active.length === 0 ? 0.6 : 1
          }}
        >Clear all</button>
      </div>
    </div>
  );
}
