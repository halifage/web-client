import { createClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { GridDataService } from '../generated/grid_data_pb';
import { ENVOY_PROXY_URL } from '../constants/config';

// Create gRPC-Web transport configured for Envoy proxy
const transport = createGrpcWebTransport({
  baseUrl: ENVOY_PROXY_URL,
});

// Export typed gRPC client
export const gridDataClient = createClient(GridDataService, transport);
