import { useState, useCallback, useRef, MutableRefObject } from 'react';
import { IChartApi, ISeriesApi } from 'lightweight-charts';
import { DrawingToolType, DrawingTool, DrawingToolsState } from './types';

export function useDrawingTools(chartRef: MutableRefObject<IChartApi | null>) {
  const [state, setState] = useState<DrawingToolsState>({
    activeTool: null,
    tools: [],
    showPanel: false,
  });

  const isDrawingRef = useRef(false);
  const currentToolRef = useRef<DrawingTool | null>(null);
  const drawingsRef = useRef<ISeriesApi<any>[]>([]); // Track created drawing series

  const setActiveTool = useCallback((tool: DrawingToolType | null) => {
    setState(prev => ({ ...prev, activeTool: tool }));
    if (chartRef.current) {
      // Enable/disable drawing mode
      if (tool) {
        // Disable crosshair for drawing
        (chartRef.current as any).applyOptions({
          crosshair: { mode: 0 }, // Disable crosshair
        });
      } else {
        // Re-enable crosshair
        (chartRef.current as any).applyOptions({
          crosshair: { mode: 1 }, // Enable crosshair
        });
      }
    }
  }, [chartRef]);

  const addTool = useCallback((tool: Omit<DrawingTool, 'id'>) => {
    const newTool: DrawingTool = {
      ...tool,
      id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setState(prev => ({
      ...prev,
      tools: [...prev.tools, newTool],
    }));
    return newTool.id;
  }, []);

  const removeTool = useCallback((toolId: string) => {
    setState(prev => ({
      ...prev,
      tools: prev.tools.filter(t => t.id !== toolId),
    }));
  }, []);

  const clearAllTools = useCallback(() => {
    // Remove all drawing series from chart
    if (chartRef.current) {
      drawingsRef.current.forEach(series => {
        try {
          (chartRef.current as any).removeSeries(series);
        } catch (error) {
          console.error('Error removing drawing series:', error);
        }
      });
    }
    drawingsRef.current = [];
    setState(prev => ({
      ...prev,
      tools: [],
    }));
  }, [chartRef]);

  const togglePanel = useCallback(() => {
    setState(prev => ({
      ...prev,
      showPanel: !prev.showPanel,
    }));
  }, []);

  const updateTool = useCallback((toolId: string, updates: Partial<DrawingTool>) => {
    setState(prev => ({
      ...prev,
      tools: prev.tools.map(t =>
        t.id === toolId ? { ...t, ...updates } : t
      ),
    }));
  }, []);

  const addDrawingSeries = useCallback((series: ISeriesApi<any>) => {
    drawingsRef.current.push(series);
  }, []);

  return {
    ...state,
    setActiveTool,
    addTool,
    removeTool,
    clearAllTools,
    togglePanel,
    updateTool,
    addDrawingSeries,
  };
}