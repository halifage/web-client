import type { TradeRow } from '../generated/grid_data_pb';

/**
 * Convert proto TradeRow to plain object for AG Grid
 */
export function tradeRowToObject(row: TradeRow) {
  return {
    id: row.id,
    traderName: row.traderName,
    symbol: row.symbol,
    tradeType: row.tradeType,
    quantity: row.quantity,
    price: row.price,
    totalValue: row.totalValue,
    status: row.status,
    timestamp: row.timestamp,
    region: row.region,
    profitLoss: row.profitLoss,
    counterparty: row.counterparty,
  };
}
