import type { ICellRendererParams } from 'ag-grid-community';

export function TradeTypeCellRenderer(params: ICellRendererParams) {
  const value = params.value as string;

  if (!value) {
    return null;
  }

  const isBuy = value.toUpperCase() === 'BUY';
  const color = isBuy ? '#16a34a' : '#dc2626';
  const arrow = isBuy ? '▲' : '▼';

  return (
    <span style={{ color, fontWeight: 600 }}>
      {arrow} {value}
    </span>
  );
}
