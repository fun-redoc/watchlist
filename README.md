# TODO next
- show details of yfin api items
- show details of watched items
- refresh button in Wealth app to fetch newest quote / course data
- register a sell of an asset
- number input should be localized
- delete all entries of watchlist
- check responsivenes of the app when there is lots of data in the indexDB, mock latency in access to yfin api
- make sidebar sizable (in css? or rather moving to styledComponents or direct styles in react)

# DONE
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
- mobil: react-native
