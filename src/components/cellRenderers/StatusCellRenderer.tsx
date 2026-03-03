import type { ICellRendererParams } from 'ag-grid-community';

const statusColors: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: '#fef3c7', text: '#92400e' },
  EXECUTED: { bg: '#d1fae5', text: '#065f46' },
  CANCELLED: { bg: '#fee2e2', text: '#991b1b' },
  FILLED: { bg: '#dbeafe', text: '#1e40af' },
  PARTIAL: { bg: '#fce7f3', text: '#9d174d' },
};

export function StatusCellRenderer(params: ICellRendererParams) {
  const value = params.value as string;

  if (!value) {
    return null;
  }

  const colors = statusColors[value.toUpperCase()] ?? { bg: '#f3f4f6', text: '#374151' };

  return (
    <span
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 500,
      }}
    >
      {value}
    </span>
  );
}
