import type { ICellRendererParams } from 'ag-grid-community';
import { formatProfitLoss } from '../../utils/formatters';

export function ProfitLossCellRenderer(params: ICellRendererParams) {
  const value = params.value as number;

  if (value === undefined || value === null) {
    return null;
  }

  const color = value >= 0 ? '#16a34a' : '#dc2626';

  return (
    <span style={{ color, fontWeight: 500 }}>
      {formatProfitLoss(value)}
    </span>
  );
}
