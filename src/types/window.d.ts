export {};

declare global {
  interface Window {
    __calyraExport?: (type: 'graph' | 'heatmap') => void;
  }
}
