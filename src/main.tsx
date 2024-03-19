import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App'
import ErrorBoundry from './components/ErrorBoudry'
import { WatchlistProvider } from './provider/WatchListProvider'
import { WealthProvider } from './provider/WealthProvider'
import { YFinProvider } from './provider/YFinProvider'
import SettingsProvider from './provider/SettingsProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundry fallback={<h1>There was an Error, please try later.</h1>}>
      <SettingsProvider>
        <WatchlistProvider>
          <WealthProvider>
            <YFinProvider>
              <App/>
            </YFinProvider>
          </WealthProvider>
        </WatchlistProvider>
      </SettingsProvider>
    </ErrorBoundry>
  </React.StrictMode>
)