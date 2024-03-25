# TODO next
- after selection dcroll to the details, provide geture or buttom to jump back to list or detail..
- proper resizing of the Chart (WealthApp e.a) - resize event and maybe a separrate chart container div to improve the client Area calculation..
- YFinApp: fetch chart data and paint it with d3 - mayb candelstick is better
- WatchApp: fetch chart data and paint it with d3 - mayb candelstick is better
- switch to DevContainers
- use caching Wealth and YFin App
- make settingspage responsive again
- show details styled
- style everything with css
- show charts
- compute stop loss signals
- refresh button in Wealth app to fetch newest quote / course data
- register a sell of an asset
- number input should be localized
- delete all entries of watchlist
- useFinaApi.ts:api_getChart function ... refactore it: result[0] takes the first result, but the index is also relevant in quote and adjquote...
  //      this can lead to mistakes, better solution could be constructing an own appropirate data structure
- check responsivenes of the app when there is lots of data in the indexDB, mock latency in access to yfin api
- settings.ts: clear, reset feature
- provide some kind of sorting for the query results, mayb generally a sorting feature in the UI (WatchListProvider.tsx, WealthProvider.tsx)
- make sidebar sizable (in css? or rather moving to styledComponents or direct styles in react)
- consider using react router instead of AppMode switch (App.tsx)
- this should be also feasible without imperativeHandle but with simple params otherwise the callbacks onShow, and onHide could be usefull aswell (Modal.tsx)
- if you only need the store for reading, make it read only => seems faster (DBManager.ts)
- update, add, get, clearAll, delete have lots of bolierplate which cann be abstracted and unified eg. using callback (DBManager.ts)
- do I really need useCallback here, maybebetter in calling Provider context (useYFinApi.ts)
- in useYFinApi.ts - remove all mock code, transfer it into a "testing area", create a testmode maybe using a dedicated framework
- WealthProvider.tsx, effect computing aggregations, if takes to long compute assyncronously and return Promise
- WealthProvider.tsx: mayb it would be more suitable if on sell the symbol remains in the list when completly sold? check out alternative approaches which feels better
- generally add abort controller everywhere there is access to fech api, especially in useEffect hooks with abort return (YFinPRovider.tsx)

# DONE
- WealthApp: fetch chart data and paint it with d3 . linechart, timeseries
- fetch quote requests
- Wealth List "kind unknown" why? and fix it (WatchApp lien 72)
- yfinance api may send an error branch, handle this approppriatelly
- introduce caching, maybe by using react query or home grown solution
- export doCached as a separate hoot
- show details of watched items
- show details of yfin api items
- delete from watchlist
- provide basic setting eg. entry for yfin api key
- repair currency entry in TransactionForm, (try to delete all default values...)
- repair, cannot delete 0 in input fields of MoneyInput component ... may be better let input text and check afterwards insetead of regexpt etc.
- improve handling non matching currencies, make it correctible
- fix the data transfer to the transactions indexDB
- yfin app still needs watchlist context to fetch the fourites (for showing the star), consider passing a checkInWatchlist function instead
- YFinApp, adding to Watchlist shoul be trasfered out of the app (analogous to buy)
- onNext buttons move from single app to main app
- frame for wealth management
- if new watch item is added it should be visible in the Watchlist View immediatelly
- show watched items as list
- hide buttoms when no asset is selecte in YFinApp, show nothing selected message instead
- Add to watchlis schould immidaitelly show the star in the list
- highlight watched items (with star sign) in the search list
- store item to watch in indexDB

# Watchlist Project

in this side project i want to write a simple personal stock & wealth watching app. I need no storage of my data in some elses cloude, i dont need ads, not even the ui is important. currently using simple jupyter notebook.

#### main features planned
- searching for stock via yfinance api
    - optionally caching of search results
- putting on watchlist (using indexDB for local storage to stay privat)
- deleting from watchlist
- showing the watchlist
- putting on wealth list (after buying)
- deleting from wealth list (after selling)
- displayin most important stock data (which changes over time)
- displaying total wealth, earnings, losses, per stock and total
- some special etf function (rebalancing simulation)
- export and download as csv or json
- targetet plattform, desktop, smartphone and iPad
- optional, a backend version 

#### features not targetet
- no tracking of cash
- storing data in a cloud service
- interface to banking api's for buying, selling etc.
- active notivication 


## tech choice
- language: typescript
- ui: react, css
- storage: browser built in indexDB
- caching: home grown using indexDB
- charting: d3
- mobil (maybe in future): react-native
