import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { TWatch } from "../models/watch";
import { DBManager, TProvideNumericID, mkDBManager } from "../dbmanagement/DBManager";
import { matchQuery } from "../hooks/useMatchQuery";

export const DB_NAME_WATCHLIST = "watchlistAppDB"
export const DB_VERSION_WATCHLIST = 2    

const WatchListContext = createContext<ReturnType<typeof useWatchlistProvider>>({} as ReturnType<typeof useWatchlistProvider>)

export const useWatchlist = () => useContext(WatchListContext) 

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  return (
    <WatchListContext.Provider value={useWatchlistProvider()}>
      {children}
    </WatchListContext.Provider>
  );
}

function filterByQuery(list:TWatch[], q:string) {
  if(!q || q.length==0) return list
  return list.filter( x => matchQuery<TWatch>(x,q))
}

interface ISymbolMap<T> {
  [key : string]: T
}
function useWatchlistProvider():{
        watchlist:TWatch[]
        query:string
        symbolToIDMap:ISymbolMap<number|undefined>
        search:(query:string) => void
        add:(asset:TWatch) => void
        del:(id:TProvideNumericID) => void
    } {
    // Types
    type WatchlistLoaderState = {
        watchlist:TWatch[]
        query:string
    }
    type WatchlistLoaderAction = {action:"setWatchList"; param:TWatch[]} |
                                 {action:"setQuery"    ; param:string}
    // States
    const [{watchlist,query}, dispatch] = useReducer((state:WatchlistLoaderState, action:WatchlistLoaderAction) => {
        switch(action.action) {
            case "setWatchList": return {...state, watchlist:action.param}
            case "setQuery":     return {...state, query:action.param}
        }
    },{
        watchlist:[],
        query:""
    })
    const db = useRef<DBManager<TWatch>|null>(null)

    // effects
    useEffect(() => {
        if(db.current) {
            db.current.list()
              .then(list => dispatch({action:"setWatchList", param:list}))
        } else {
            mkDBManager<TWatch>(DB_NAME_WATCHLIST, "watch", DB_VERSION_WATCHLIST,[{indexName:"symbol",isUnique:true}])
                .then(dbManager => {db.current = dbManager; return dbManager.list()} )
                .then(list => dispatch({action:"setWatchList", param:list}))
        }
    },[])

    // memoized values
    const filteredWatchlist = useMemo(
        () => filterByQuery(watchlist, query),
        [watchlist, query]
    )

    const symbolToIDMap = useMemo<ISymbolMap<number|undefined>>(
      () => watchlist.reduce((m,v)=> {m[v.symbol] = v.id; return m},{} as ISymbolMap<number|undefined>),
      [watchlist]
    )

    // exported access functions
    const search = useCallback( (query:string) => {
        dispatch({action:"setQuery", param:query})
    }, [])

    const add = useCallback( (asset:TWatch) => {
        db.current?.add(asset)
        .then(newId => {
            dispatch({action:"setWatchList", param:[...watchlist, {...asset, id:newId}]})
        })
    }, [watchlist])

    const del = useCallback( (id:TProvideNumericID) => {
      if(id.id) {
        db.current?.del(id.id)
        .then(success => {
            if(success) {
              const newWatchlist = watchlist.filter(v => v.id !== id.id)
              dispatch({action:"setWatchList", param:newWatchlist})
            }
        })
        .catch(reason => {
          console.error(`failed to delete objet with id ${id.id} reason: ${reason}`)
        })
      } else {
        console.error("nothing to delete, undefined value for id")
      }
    }, [watchlist])

    return {watchlist:filteredWatchlist, query, symbolToIDMap, search, add, del}
}
