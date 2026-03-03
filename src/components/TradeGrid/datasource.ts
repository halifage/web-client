import type { IDatasource, IGetRowsParams } from 'ag-grid-community';
import { gridDataClient } from '../../api/client';
import { mapFilterModel } from '../../utils/filterModelMapper';
import { mapSortModel } from '../../utils/sortModelMapper';
import { tradeRowToObject } from '../../utils/tradeRowMapper';

/**
 * Creates an infinite datasource for AG Grid
 */
export function createInfiniteDatasource(): IDatasource {
  return {
    getRows: async (params: IGetRowsParams) => {
      const { startRow, endRow, sortModel, filterModel, successCallback, failCallback } = params;

      try {
        const response = await gridDataClient.getRows({
          startRow: startRow ?? 0,
          endRow: endRow ?? 100,
          sortModel: mapSortModel(sortModel),
          filterModel: mapFilterModel(filterModel as Record<string, unknown>),
        });

        // Convert proto rows to plain objects
        const rows = response.rows.map(tradeRowToObject);

        // Determine last row for infinite scroll
        // lastRow = -1 means more rows available, otherwise it's the total count
        const lastRow = response.lastRow === -1 ? undefined : response.lastRow;

        successCallback(rows, lastRow);
      } catch (error) {
        console.error('Error fetching rows:', error);
        failCallback();
      }
    },
  };
}
