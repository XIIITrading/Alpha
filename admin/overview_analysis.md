# Alpha V1 Trading Tool - System Overview
## Architecture Overview
### Electron Frontend
- Multi-window management (Scanner, Positions, Charts)
- IPC Bridge for process communication
- ag-Grid integration for real-time updates
- Perspective.js for data visualization

### Electron Main Process
- AppUpdater
- IPCHandler
- MenuBuilder
- PolygonBridge
- StateManager
- WindowManager

### Python Backend
- api_validator
- config
- core
- exceptions
- fetcher
- rate_limiter
- storage
- utils
- websocket


## Core Data Structures
### Market Data Format
```javascript
```

### Window State
```javascript
```


## Data Flow Pipeline
### 1. Market Data Ingestion
- Polygon.io WebSocket → Python validation → Message queue
- Throughput: 1,000-5,000 messages/second

### 2. Data Transformation
- Raw quotes/trades → Aggregated bars → Technical indicators
- Latency: <10ms processing time

### 3. IPC Distribution
- Python → Electron Main → Renderer processes

### 4. UI Updates
- Grid updates, chart rendering, alert triggers
- Performance: 60 FPS capability


## Trading Features
### Scanners
- **Gap Scanner**: Pre-market gap detection

### Calculators
- **Momentum Tracker**: Velocity and acceleration

### Analyzers
- **Volume Analyzer**: Relative volume detection


## Technology Stack
### Frontend
- **Electron**: 28.1.0
- **ag-Grid**: ^32.2.2
- **Node.js**: >=16.0.0


## Performance Characteristics
- **Message Processing**: 1,000-5,000 msg/sec
- **Calculation Throughput**: 10,000+ calculations/second  
- **UI Update Rate**: 60 FPS capability
- **Memory Usage**: ~500MB base + 1MB per 100 symbols
- **Latency**: <10ms from WebSocket to UI
