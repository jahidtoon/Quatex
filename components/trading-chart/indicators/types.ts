import { ISeriesApi } from 'lightweight-charts';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type IndicatorKey =
  | 'sma'
  | 'bb'
  | 'envelopes'
  | 'fractal'
  | 'ichimoku'
  | 'keltner'
  | 'donchian'
  | 'supertrend'
  | 'psar'
  | 'zigzag'
  | 'alligator'
  | 'volume';

export interface LineOutput {
  type: 'line';
  color: string;
  data: Array<{ time: number; value: number }>; // Only valid numbers, no nulls
}

export interface AreaOutput {
  type: 'area';
  color: string;
  data: Array<{ time: number; value: number }>; // Only valid numbers, no nulls
}

export interface HistogramOutput {
  type: 'histogram';
  color: string;
  data: Array<{ time: number; value: number; color?: string }>; // Volume data with optional color
}

export type IndicatorOutput = LineOutput | AreaOutput | HistogramOutput;

export interface IndicatorDefinition {
  key: IndicatorKey;
  label: string;
}

export interface IndicatorConfig {
  key: IndicatorKey;
  colors: string[];
  periods?: { [key: string]: number };
}

export type SeriesEntry = { key: IndicatorKey; series: ISeriesApi<any>[] };
