# Electron Architecture Analysis

## Main Process Components

### IPCHandler.js
**Classes:**
- IPCHandler
  - constructor(param)
  - setupHandlers()
  - setupSystemHandlers()
  - setupStateHandlers()
  - setupWindowHandlers()

### WindowManager.js
**Classes:**
- WindowManager
  - constructor(param)
  - createWindow(param, param)
  - loadWindowContent(window, windowType, typeConfig)
  - setupWindowEvents(window, windowId)
  - getWindow(windowId)

### StateManager.js
**Classes:**
- StateManager
  - constructor(param)
  - getDefaultState()
  - initialize()
  - get(key, defaultValue)
  - set(key, value)

### AppUpdater.js
**Classes:**
- AppUpdater
  - constructor(param)
  - initialize()
  - configureUpdater()
  - setupEventHandlers()
  - setupIPCHandlers()


## IPC Communication

### IPC Channels

| Channel | Type | Source |
|---------|------|--------|
| window:create | handle | WindowManager.js |
| window:close | handle | WindowManager.js |
| window:get-state | handle | WindowManager.js |
| window:get-group | handle | WindowManager.js |
| updater:check | handle | AppUpdater.js |
| updater:download | handle | AppUpdater.js |
| updater:install | handle | AppUpdater.js |
| updater:get-state | handle | AppUpdater.js |
| updater:set-config | handle | AppUpdater.js |
| updater:register-window | handle | AppUpdater.js |

### Message Formats

**market-data**
- Direction: main → renderer
- Payload: `{ symbol, price, volume, timestamp }`
- Frequency: Real-time

**window-state**
- Direction: renderer → main
- Payload: `{ bounds, data, preferences }`
- Frequency: On change

**scanner-config**
- Direction: renderer ↔ main
- Payload: `{ conditions, columns, filters }`
- Frequency: On demand


## Window Management

### Window Types

**Alpha V1 Trading Tool** (main)
- Default Size: 1400x900
- Features: Multi-instance, State persistence, IPC integration

**Scanner Window** (scanner)
- Default Size: 1200x800
- Features: Multi-instance, State persistence, IPC integration

**Positions Tracker** (positions)
- Default Size: 1200x800
- Features: Multi-instance, State persistence, IPC integration

**Chart Window** (chart)
- Default Size: 1000x700
- Features: Multi-instance, State persistence, IPC integration


## Renderer Process

### Bridge Layer

- **index.js**: 

### Modules


## Configuration System

### app.config.js
Type: Application

```javascript
{
  common: {
    autoUpdate: true,
    multiWindow: true,
    defaultTheme: 'dark'
  },
  development: {
    devTools: true,
    hotReload: true,
    logLevel: 'debug'
  },
  production: {
    devToo
// ...
```

### shortcuts.config.js
Type: General

```javascript
{
  global: {
    'new-window': 'CommandOrControl+N',
    'close-window': 'CommandOrControl+W',
    'quit': 'CommandOrControl+Q',
    'toggle-devtools': 'F12',
    'reload': 'CommandOrControl+R'
  }
}
```

### window.config.js
Type: Window

```javascript
{
    ...windowConfig,
    getWindowConfig
}
```

