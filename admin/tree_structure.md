# Project Structure
Last updated: 2025-06-24 17:14:34

```
Alpha/
│   ├── .env
│   ├── README.md # Project documentation
│   ├── git_commit_push.py
│   ├── git_latest_pull_replace.py
│   ├── package-lock.json
│   ├── package.json
│   ├── start_server.bat
│   ├── admin/
│   │   ├── tree_structure.md
│   │   ├── update_tree.py
│   ├── electron/
│   │   ├── README.md # Project documentation
│   │   ├── create-symlink.bat
│   │   ├── main.js
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── polygon_debug_test.log
│   │   ├── preload.js
│   │   ├── config/
│   │   │   ├── app.config.js
│   │   │   ├── shortcuts.config.js
│   │   │   ├── window.config.js
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── AppUpdater.js
│   │   │   │   ├── IPCHandler.js
│   │   │   │   ├── MenuBuilder.js
│   │   │   │   ├── PolygonBridge.js
│   │   │   │   ├── StateManager.js
│   │   │   │   ├── WindowManager.js
│   │   │   │   ├── DataTransformationService/
│   │   │   │   │   ├── MarketDataStore.js
│   │   │   │   │   ├── index.js
│   │   │   │   │   ├── calculators/
│   │   │   │   │   │   ├── ChangeCalculator.js
│   │   │   │   │   │   ├── VolumeCalculator.js
│   │   │   │   │   ├── transformers/
│   │   │   │   │   │   ├── BarTransformer.js
│   │   │   │   │   │   ├── QuoteTransformer.js
│   │   │   │   │   │   ├── TradeTransformer.js
│   │   │   ├── renderer/
│   │   │   │   ├── GridManager.js
│   │   │   │   ├── bridge.js
│   │   │   │   ├── index.html
│   │   │   │   ├── index.js
│   │   │   │   ├── test-full-integration.html
│   │   │   │   ├── test-module-loading.html
│   │   │   │   ├── archived/
│   │   │   │   │   ├── bridge.js.backup-2025-01-15
│   │   │   │   │   ├── grid-manager-backup.js
│   │   │   │   ├── assets/
│   │   │   │   │   ├── vendor/
│   │   │   │   │   │   ├── ag-grid/
│   │   │   │   │   │   │   ├── ag-grid-community.min.js
│   │   │   │   │   │   │   ├── ag-grid-no-native-widgets.css
│   │   │   │   │   │   │   ├── ag-grid-no-native-widgets.min.css
│   │   │   │   │   │   │   ├── ag-grid.css
│   │   │   │   │   │   │   ├── ag-grid.min.css
│   │   │   │   │   │   │   ├── ag-theme-alpine-no-font.css
│   │   │   │   │   │   │   ├── ag-theme-alpine-no-font.min.css
│   │   │   │   │   │   │   ├── ag-theme-alpine.css
│   │   │   │   │   │   │   ├── ag-theme-alpine.min.css
│   │   │   │   │   │   │   ├── ag-theme-balham-no-font.css
│   │   │   │   │   │   │   ├── ag-theme-balham-no-font.min.css
│   │   │   │   │   │   │   ├── ag-theme-balham.css
│   │   │   │   │   │   │   ├── ag-theme-balham.min.css
│   │   │   │   │   │   │   ├── ag-theme-material-no-font.css
│   │   │   │   │   │   │   ├── ag-theme-material-no-font.min.css
│   │   │   │   │   │   │   ├── ag-theme-material.css
│   │   │   │   │   │   │   ├── ag-theme-material.min.css
│   │   │   │   │   │   │   ├── ag-theme-quartz-no-font.css
│   │   │   │   │   │   │   ├── ag-theme-quartz-no-font.min.css
│   │   │   │   │   │   │   ├── ag-theme-quartz.css
│   │   │   │   │   │   │   ├── ag-theme-quartz.min.css
│   │   │   │   │   │   │   ├── agGridAlpineFont.css
│   │   │   │   │   │   │   ├── agGridAlpineFont.min.css
│   │   │   │   │   │   │   ├── agGridBalhamFont.css
│   │   │   │   │   │   │   ├── agGridBalhamFont.min.css
│   │   │   │   │   │   │   ├── agGridClassicFont.css
│   │   │   │   │   │   │   ├── agGridClassicFont.min.css
│   │   │   │   │   │   │   ├── agGridMaterialFont.css
│   │   │   │   │   │   │   ├── agGridMaterialFont.min.css
│   │   │   │   │   │   │   ├── agGridQuartzFont.css
│   │   │   │   │   │   │   ├── agGridQuartzFont.min.css
│   │   │   │   ├── bridge/
│   │   │   │   │   ├── README.md # Project documentation
│   │   │   │   │   ├── index.js
│   │   │   │   │   ├── restore-bridge.ps1
│   │   │   │   │   ├── config/
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   ├── premarketConfigs.js
│   │   │   │   │   │   ├── tableConfigs.js
│   │   │   │   │   ├── core/
│   │   │   │   │   │   ├── gridManager.js
│   │   │   │   │   │   ├── initialization.js
│   │   │   │   │   ├── dashboards/
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   ├── utils.js
│   │   │   │   │   │   ├── premarket/
│   │   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   │   ├── styles.js
│   │   │   │   │   ├── data/
│   │   │   │   │   │   ├── tableManager.js
│   │   │   │   │   │   ├── updateHandler.js
│   │   │   │   │   ├── modules/
│   │   │   │   │   │   ├── gapScanner.js
│   │   │   │   │   │   ├── hvnProximity.js
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   ├── marketStructure.js
│   │   │   │   │   │   ├── momentum.js
│   │   │   │   │   ├── state/
│   │   │   │   │   │   ├── bridgeState.js
│   │   │   │   │   ├── test/
│   │   │   │   │   │   ├── configTest.js
│   │   │   │   │   │   ├── dashboardTest.js
│   │   │   │   │   │   ├── dataTest.js
│   │   │   │   │   │   ├── integrationTest.js
│   │   │   │   │   │   ├── modulesTest.js
│   │   │   │   │   │   ├── stateTest.js
│   │   │   │   │   ├── utils/
│   │   │   │   │   │   ├── helpers.js
│   │   │   │   │   ├── viewers/
│   │   │   │   │   │   ├── viewerManager.js
│   │   │   │   ├── grid-manager/
│   │   │   │   │   ├── README.md # Project documentation
│   │   │   │   │   ├── index.js
│   │   │   │   │   ├── package.json
│   │   │   │   │   ├── comparators/
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   ├── percentChange.js
│   │   │   │   │   ├── config/
│   │   │   │   │   │   ├── animations.js
│   │   │   │   │   │   ├── gridDefaults.js
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   ├── themes.js
│   │   │   │   │   ├── core/
│   │   │   │   │   │   ├── ColumnBuilder.js
│   │   │   │   │   │   ├── GridCreator.js
│   │   │   │   │   │   ├── GridEvents.js
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   ├── formatters/
│   │   │   │   │   │   ├── currency.js
│   │   │   │   │   │   ├── datetime.js
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   ├── largeNumber.js
│   │   │   │   │   │   ├── percent.js
│   │   │   │   │   ├── renderers/
│   │   │   │   │   │   ├── AlertRenderer.js
│   │   │   │   │   │   ├── GapTypeRenderer.js
│   │   │   │   │   │   ├── PLRenderer.js
│   │   │   │   │   │   ├── PriceChangeRenderer.js
│   │   │   │   │   │   ├── SignalStrengthRenderer.js
│   │   │   │   │   │   ├── VolumeBarRenderer.js
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   ├── state/
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   ├── stateManager.js
│   │   │   │   │   ├── styles/
│   │   │   │   │   │   ├── animations.js
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   ├── renderers.js
│   │   │   │   │   │   ├── themes.js
│   │   │   │   │   ├── test/
│   │   │   │   │   │   ├── comparatorsTest.js
│   │   │   │   │   │   ├── configTest.js
│   │   │   │   │   │   ├── coreTest.js
│   │   │   │   │   │   ├── formatterTest.js
│   │   │   │   │   │   ├── importTest.js
│   │   │   │   │   │   ├── integrationTest.js
│   │   │   │   │   │   ├── mockData.js
│   │   │   │   │   │   ├── mockRendererEnvironment.js
│   │   │   │   │   │   ├── renderersTest.js
│   │   │   │   │   │   ├── stateTest.js
│   │   │   │   │   │   ├── structureTest.js
│   │   │   │   │   │   ├── test-phase5-updates.js
│   │   │   │   │   │   ├── test-phase6-styles.js
│   │   │   │   │   │   ├── test-phase7-utils.js
│   │   │   │   │   │   ├── test-shim.js
│   │   │   │   │   │   ├── test-shim.mjs
│   │   │   │   │   ├── updates/
│   │   │   │   │   │   ├── UpdateMetrics.js
│   │   │   │   │   │   ├── UpdateProcessor.js
│   │   │   │   │   │   ├── UpdateQueue.js
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   ├── utils/
│   │   │   │   │   │   ├── ColumnManager.js
│   │   │   │   │   │   ├── ExportManager.js
│   │   │   │   │   │   ├── FilterManager.js
│   │   │   │   │   │   ├── HeaderFormatter.js
│   │   │   │   │   │   ├── index.js
│   │   ├── tests/
│   │   │   ├── debug/
│   │   │   │   ├── polygon-bridge-monitor.js
│   │   │   │   ├── test-websocket-raw.js
│   │   │   ├── integration/
│   │   │   │   ├── test-data-flow.js
│   │   │   │   ├── test-polygon-integration.js
│   │   │   ├── unit/
│   ├── modules/
│   │   ├── momentum_leaders/
│   ├── polygon/
│   │   ├── README.md # Project documentation
│   │   ├── __init__.py
│   │   ├── api_validator.py
│   │   ├── config.py # Configuration settings
│   │   ├── core.py
│   │   ├── exceptions.py
│   │   ├── fetcher.py
│   │   ├── rate_limiter.py
│   │   ├── storage.py
│   │   ├── utils.py
│   │   ├── websocket.py
│   │   ├── data/
│   │   │   ├── rate_limit_stats.json
│   │   │   ├── cache/
│   │   │   │   ├── polygon_cache.db
│   │   │   ├── logs/
│   │   │   │   ├── polygon.log
│   │   │   ├── parquet/
│   │   │   │   ├── symbols/
│   │   │   │   │   ├── AAPL/
│   │   │   │   │   │   ├── AAPL_15min.parquet
│   │   │   │   │   │   ├── AAPL_1day.parquet
│   │   │   │   │   │   ├── AAPL_1hour.parquet
│   │   │   │   │   │   ├── AAPL_1min.parquet
│   │   │   │   │   │   ├── AAPL_5min.parquet
│   │   │   │   │   ├── AMD/
│   │   │   │   │   │   ├── AMD_15min.parquet
│   │   │   │   │   │   ├── AMD_1day.parquet
│   │   │   │   │   │   ├── AMD_1hour.parquet
│   │   │   │   │   │   ├── AMD_1min.parquet
│   │   │   │   │   ├── AMZN/
│   │   │   │   │   │   ├── AMZN_1day.parquet
│   │   │   │   │   │   ├── AMZN_1min.parquet
│   │   │   │   │   ├── GOOG/
│   │   │   │   │   │   ├── GOOG_15min.parquet
│   │   │   │   │   │   ├── GOOG_1day.parquet
│   │   │   │   │   │   ├── GOOG_1min.parquet
│   │   │   │   │   ├── GOOGL/
│   │   │   │   │   │   ├── GOOGL_1day.parquet
│   │   │   │   │   ├── MSFT/
│   │   │   │   │   │   ├── MSFT_1day.parquet
│   │   │   │   │   │   ├── MSFT_1min.parquet
│   │   │   │   │   ├── NVDA/
│   │   │   │   │   │   ├── NVDA_15min.parquet
│   │   │   │   │   │   ├── NVDA_1day.parquet
│   │   │   │   │   │   ├── NVDA_1hour.parquet
│   │   │   │   │   │   ├── NVDA_1min.parquet
│   │   │   │   │   ├── OKLO/
│   │   │   │   │   │   ├── OKLO_15min.parquet
│   │   │   │   │   │   ├── OKLO_1day.parquet
│   │   │   │   │   │   ├── OKLO_1hour.parquet
│   │   │   │   │   │   ├── OKLO_1min.parquet
│   │   │   │   │   ├── PLTR/
│   │   │   │   │   │   ├── PLTR_15min.parquet
│   │   │   │   │   │   ├── PLTR_1day.parquet
│   │   │   │   │   │   ├── PLTR_1hour.parquet
│   │   │   │   │   │   ├── PLTR_1min.parquet
│   │   │   │   │   ├── SPY/
│   │   │   │   │   │   ├── SPY_5min.parquet
│   │   │   │   │   ├── TSLA/
│   │   │   │   │   │   ├── TSLA_15min.parquet
│   │   │   │   │   │   ├── TSLA_1day.parquet
│   │   │   │   │   │   ├── TSLA_1hour.parquet
│   │   │   │   │   │   ├── TSLA_1min.parquet
│   │   ├── docs/
│   │   │   ├── config_overview.txt
│   │   │   ├── core_overview.txt
│   │   │   ├── exceptions_overview.txt
│   │   │   ├── fetcher_overview.txt
│   │   │   ├── polygon_components_breakdown.txt
│   │   │   ├── polygon_pre_synopsis.txt
│   │   │   ├── polygon_structure.txt
│   │   │   ├── rate_limiter.txt
│   │   │   ├── storage_overview.txt
│   │   │   ├── utils_overview.txt
│   │   │   ├── validators_overview.txt
│   │   │   ├── websocket.txt
│   │   │   ├── websocket_client.txt
│   │   ├── polygon_server/
│   │   │   ├── __init__.py
│   │   │   ├── config.py # Configuration settings
│   │   │   ├── models.py
│   │   │   ├── requirements.txt # Python dependencies
│   │   │   ├── server.py
│   │   │   ├── start_server.py
│   │   │   ├── endpoints/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── health.py
│   │   │   │   ├── rest.py
│   │   │   │   ├── websocket.py
│   │   │   ├── utils/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── json_encoder.py
│   │   ├── tests/
│   │   │   ├── test_monitor_websocket.py
│   │   │   ├── test_websocket_live.py
│   │   ├── validators/
│   │   │   ├── __init__.py
│   │   │   ├── anomalies.py
│   │   │   ├── api_features.py
│   │   │   ├── data_quality.py
│   │   │   ├── gaps.py
│   │   │   ├── market_hours.py
│   │   │   ├── ohlcv.py
│   │   │   ├── symbol.py
```
