# web-client

React + AG Grid frontend that displays a real-time trade grid over gRPC-Web.

## Prerequisites

- Node.js 18+
- [grpc-server](https://github.com/halifage/grpc-server) running on `:9090`
- Envoy proxy running on `:8080` (translates gRPC-Web to gRPC)

## Setup

```bash
npm install
npm run dev
```

Opens at http://localhost:5173.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm run proto:generate` | Regenerate TypeScript from `proto/grid_data.proto` |

## Architecture

- **AG Grid** with infinite row model — pages fetched on scroll via `GetGridData` RPC
- **Real-time updates** streamed via `StreamUpdates` server-streaming RPC
- **Search** via `SearchTrades` unary RPC with field/operator/value filters
- **Connect-Web** (`@connectrpc/connect-web`) handles gRPC-Web transport through Envoy on `localhost:8080`

## Stack

- React 18, TypeScript, Vite
- AG Grid Community 32
- Connect-Web (gRPC-Web client)
- Buf for protobuf code generation
