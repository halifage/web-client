import { useState, useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { GridApi, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { useColumnDefs, useStreamUpdates, useSearchTrades, type ConnectionStatus } from '../../hooks';
import { createInfiniteDatasource } from './datasource';
import { CACHE_BLOCK_SIZE } from '../../constants/config';
import { SearchBar } from '../SearchBar';

const statusLabels: Record<ConnectionStatus, string> = {
  connecting: 'Connecting...',
  connected: 'Live',
  disconnected: 'Disconnected',
  paused: 'Paused',
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
  backgroundColor: '#f8fafc',
  borderBottom: '1px solid #e2e8f0',
};

const titleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 600,
  color: '#1e293b',
};

const controlsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const statusIndicatorStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '13px',
  color: '#64748b',
};

const gridWrapperStyle: React.CSSProperties = {
  flex: 1,
  width: '100%',
};

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  fontSize: '16px',
  color: '#64748b',
};

const errorStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  fontSize: '16px',
  color: '#ef4444',
};

function getStatusDotStyle(status: ConnectionStatus): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  };

  const colors: Record<ConnectionStatus, string> = {
    connected: '#22c55e',
    connecting: '#f59e0b',
    disconnected: '#ef4444',
    paused: '#64748b',
  };

  return {
    ...baseStyle,
    backgroundColor: colors[status],
    boxShadow: status === 'connected' ? '0 0 6px #22c55e' : undefined,
  };
}

function getToggleButtonStyle(isPaused: boolean): React.CSSProperties {
  return {
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#fff',
    backgroundColor: isPaused ? '#22c55e' : '#3b82f6',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  };
}

export function TradeGrid() {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const { columnDefs, loading, error } = useColumnDefs();
  const { status, isPaused, toggle } = useStreamUpdates({ gridApi });
  const { results: searchResults, loading: searchLoading, search, clear: clearSearch } = useSearchTrades();
  const isSearchActive = searchResults !== null;

  // Create datasource
  const datasource = useMemo(() => createInfiniteDatasource(), []);

  // Handle grid ready
  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
  }, []);

  // Default column definitions
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      minWidth: 100,
    }),
    []
  );

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>Loading column definitions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Trade Grid</h1>
        <div style={controlsStyle}>
          <div style={statusIndicatorStyle}>
            <span style={getStatusDotStyle(status)} />
            <span>{statusLabels[status]}</span>
          </div>
          <button
            style={getToggleButtonStyle(isPaused)}
            onClick={toggle}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </header>
      <SearchBar
        columnDefs={columnDefs}
        onSearch={search}
        onClear={clearSearch}
        isSearchActive={isSearchActive}
        resultCount={searchResults ? searchResults.length : null}
        loading={searchLoading}
      />
      <div style={gridWrapperStyle} className="ag-theme-quartz">
        {isSearchActive ? (
          <AgGridReact
            key="search"
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowData={searchResults}
            getRowId={(params) => params.data.id}
            onGridReady={onGridReady}
            animateRows={true}
            enableCellChangeFlash={true}
          />
        ) : (
          <AgGridReact
            key="infinite"
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowModelType="infinite"
            datasource={datasource}
            cacheBlockSize={CACHE_BLOCK_SIZE}
            maxBlocksInCache={10}
            getRowId={(params) => params.data.id}
            onGridReady={onGridReady}
            animateRows={true}
            enableCellChangeFlash={true}
          />
        )}
      </div>
    </div>
  );
}
