import { useState, useEffect, useMemo } from 'react';
import type { ColDef, ValueFormatterParams, ICellRendererParams } from 'ag-grid-community';
import { gridDataClient } from '../api/client';
import type { ColumnDefinition } from '../generated/grid_data_pb';
import { formatCurrency, formatNumber, formatDateTime } from '../utils/formatters';
import {
  TradeTypeCellRenderer,
  StatusCellRenderer,
  ProfitLossCellRenderer,
} from '../components/cellRenderers';

type CellRenderer = (params: ICellRendererParams) => React.ReactNode;

// Map cell renderer names from server to actual components
const cellRendererMap: Record<string, CellRenderer> = {
  tradeTypeCellRenderer: TradeTypeCellRenderer,
  statusCellRenderer: StatusCellRenderer,
  profitLossCellRenderer: ProfitLossCellRenderer,
};

// Map value formatter names to functions
const valueFormatterMap: Record<string, (params: ValueFormatterParams) => string> = {
  currencyFormatter: (params) => (params.value != null ? formatCurrency(params.value) : ''),
  numberFormatter: (params) => (params.value != null ? formatNumber(params.value) : ''),
  dateTimeFormatter: (params) => (params.value != null ? formatDateTime(params.value) : ''),
  quantityFormatter: (params) => (params.value != null ? formatNumber(params.value, 0) : ''),
};

/**
 * Hook to fetch column definitions from the server
 */
export function useColumnDefs() {
  const [serverColumns, setServerColumns] = useState<ColumnDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchColumnDefs() {
      try {
        const response = await gridDataClient.getColumnDefinitions({});
        if (mounted) {
          setServerColumns(response.columns);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch column definitions'));
          setLoading(false);
        }
      }
    }

    fetchColumnDefs();

    return () => {
      mounted = false;
    };
  }, []);

  // Convert server column definitions to AG Grid ColDef
  const columnDefs: ColDef[] = useMemo(() => {
    return serverColumns.map((col) => {
      const colDef: ColDef = {
        field: col.field,
        headerName: col.headerName,
        sortable: col.sortable,
        filter: col.filterable ? col.filterType || true : false,
        width: col.width || undefined,
        editable: col.editable,
      };

      // Apply cell renderer if specified
      if (col.cellRenderer && cellRendererMap[col.cellRenderer]) {
        colDef.cellRenderer = cellRendererMap[col.cellRenderer];
      }

      // Apply value formatter if specified
      if (col.valueFormatter && valueFormatterMap[col.valueFormatter]) {
        colDef.valueFormatter = valueFormatterMap[col.valueFormatter];
      }

      return colDef;
    });
  }, [serverColumns]);

  return { columnDefs, loading, error };
}
