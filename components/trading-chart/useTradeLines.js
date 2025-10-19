// Simple Trade Line Hook for Chart
// Provides click-to-create and drag-to-move functionality

import { useState, useCallback, useRef, useEffect } from 'react';

export const useTradeLines = (chartRef, seriesRef, isActive = false) => {
  const [tradeLines, setTradeLines] = useState([]);
  const [selectedLine, setSelectedLine] = useState(null);
  const dragState = useRef({ isDragging: false, dragPoint: null, lineId: null });

  // Create a new trade line
  const createTradeLine = useCallback((time, price) => {
    if (!seriesRef.current) return;

    const newLine = {
      id: Date.now().toString(),
      startTime: time,
      startPrice: price,
      endTime: time + 3600, // 1 hour default
      endPrice: price + (price * 0.01), // 1% up default
      priceLine: null,
      visible: true
    };

    try {
      // Create a horizontal price line as visual representation
      const priceLine = seriesRef.current.createPriceLine({
        price: price,
        color: '#2962FF',
        lineWidth: 2,
        lineStyle: 0, // solid
        axisLabelVisible: true,
        title: `Line ${tradeLines.length + 1}`,
      });

      newLine.priceLine = priceLine;
      
      setTradeLines(prev => [...prev, newLine]);
      setSelectedLine(newLine.id);
      
      console.log('📈 Trade line created:', newLine.id);
      return newLine.id;
    } catch (error) {
      console.error('Error creating trade line:', error);
      return null;
    }
  }, [tradeLines.length, seriesRef]);

  // Update trade line position
  const updateTradeLine = useCallback((lineId, updates) => {
    setTradeLines(prev => prev.map(line => {
      if (line.id === lineId && line.priceLine) {
        const updatedLine = { ...line, ...updates };
        
        try {
          // Update the price line
          line.priceLine.applyOptions({
            price: updates.startPrice || line.startPrice,
            title: `Line (${(updates.startPrice || line.startPrice).toFixed(4)})`,
          });
        } catch (error) {
          console.warn('Could not update price line:', error);
        }
        
        return updatedLine;
      }
      return line;
    }));
  }, []);

  // Remove a trade line
  const removeTradeLine = useCallback((lineId) => {
    setTradeLines(prev => {
      const lineToRemove = prev.find(line => line.id === lineId);
      
      if (lineToRemove?.priceLine && seriesRef.current) {
        try {
          seriesRef.current.removePriceLine(lineToRemove.priceLine);
        } catch (error) {
          console.warn('Could not remove price line:', error);
        }
      }
      
      return prev.filter(line => line.id !== lineId);
    });
    
    if (selectedLine === lineId) {
      setSelectedLine(null);
    }
    
    console.log('🗑️ Trade line removed:', lineId);
  }, [selectedLine, seriesRef]);

  // Clear all trade lines
  const clearAllTradeLines = useCallback(() => {
    tradeLines.forEach(line => {
      if (line.priceLine && seriesRef.current) {
        try {
          seriesRef.current.removePriceLine(line.priceLine);
        } catch (error) {
          console.warn('Could not remove price line:', error);
        }
      }
    });
    
    setTradeLines([]);
    setSelectedLine(null);
    console.log('🗑️ All trade lines cleared');
  }, [tradeLines, seriesRef]);

  // Handle chart click to create new line
  const handleChartClick = useCallback((param) => {
    // Only create lines when trade line mode is active
    if (!isActive || !param.time || !param.point || !chartRef.current || !seriesRef.current) return;
    
    // Don't create line if we're dragging
    if (dragState.current.isDragging) return;
    
    try {
      const price = seriesRef.current.coordinateToPrice(param.point.y);
      
      if (price === null) return;
      
      const timeValue = param.time;
      createTradeLine(timeValue, price);
    } catch (error) {
      console.error('Error handling chart click:', error);
    }
  }, [createTradeLine, chartRef, seriesRef, isActive]);

  // Setup chart event listeners
  useEffect(() => {
    if (!chartRef.current || !isActive) return;

    const chart = chartRef.current;
    
    // Subscribe to click events only when active
    chart.subscribeClick(handleChartClick);

    return () => {
      // Cleanup event listeners
      try {
        chart.unsubscribeClick(handleChartClick);
      } catch (error) {
        console.warn('Could not unsubscribe click handler:', error);
      }
    };
  }, [chartRef, handleChartClick, isActive]);

  // Cleanup all lines when component unmounts
  useEffect(() => {
    return () => {
      clearAllTradeLines();
    };
  }, [clearAllTradeLines]);

  return {
    tradeLines,
    selectedLine,
    setSelectedLine,
    createTradeLine,
    updateTradeLine,
    removeTradeLine,
    clearAllTradeLines,
    dragState
  };
};