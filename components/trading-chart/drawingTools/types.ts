export type DrawingToolType =
  | 'trendline'
  | 'horizontal'
  | 'vertical'
  | 'rectangle'
  | 'fibonacci'
  | 'arrow'
  | 'text'
  | 'brush'
  | 'eraser';

export interface DrawingTool {
  id: string;
  type: DrawingToolType;
  points: Array<{ time: number; price: number }>;
  color: string;
  width: number;
  style?: 'solid' | 'dashed' | 'dotted';
  text?: string;
  visible: boolean;
}

export interface DrawingToolsState {
  activeTool: DrawingToolType | null;
  tools: DrawingTool[];
  showPanel: boolean;
}