import React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { DBManager, mkDBManager } from "../dbmanagement/DBManager";
import useYFinApi, { YFinQuoteResult } from "../hooks/useYFinApi";
import { matchQuery } from "../hooks/useMatchQuery";

export const DB_NAME_WEALTH = "wealthAppDB"
export const DB_VERSION_WEALTH = 3    

const WealthContext = createContext<ReturnType<typeof useWealthProvider>>({} as ReturnType<typeof useWealthProvider>)
// eslint-disable-next-line react-refresh/only-export-components
export const useWealth = () => useContext(WealthContext)
export function WealthProvider({ children }: { children: React.ReactNode }) {
  return (
    <WealthContext.Provider value={useWealthProvider()}>
      {children}
    </WealthContext.Provider>
  );
}

export type TOrder = {
    date:Date
    symbol:string
    amount:number 
    price:number
    fees:number
    currency:string
} & {
    marketplace:string
    bank:string
    kind:string
}

export type TTransaction = {
    id?:number
} & {
    action:"buy" | "sell"
} & TOrder

interface TAggregate {
    count:number
    fees:number
    netValue:number
    avgPrice:number
}
export type TWealth = {
        symbol:string
        longName?:string
        shortName?:string
        kind?:string
        currency?:string
        holding:TAggregate
        sold:TAggregate
        dividend?:number
}

interface TWealthBySymbol {
    [bySymbol : string] : TWealth
}
type YFinQuoteBySymbol = {
    [bySymbol : string]:YFinQuoteResult
}

// the hook "Constructor"
function useWealthProvider():{
    filteredMasterdata:YFinQuoteBySymbol
    aggregations:TWealthBySymbol
    query:string
    search:(query:string) => void
    buy:(order:TOrder)  => void
    sell:(order:TOrder) => void
} {
    const {getAssetBatch} = useYFinApi()
    // state and action types for reducer based state management
    type TState = {
        db:DBManager<TTransaction>|null
        symbols:Set<string>
        masterData:YFinQuoteBySymbol
        transactions:TTransaction[]
        timestamp:ReturnType<typeof Date.now> // used to trigger masterdata reload effect
        query:string
    }
    type TAction = 
                   {action:"setDB", params:DBManager<TTransaction>} |
                   {action:"setTransactions", params:TTransaction[]} |
                   {action:"setQuery", params:string} |
                   {action:"setSymbols", params:string[]} |
                   {action:"setSymbolsAsSet", params:Set<string>} |
                   {action:"setMasterData", params:YFinQuoteBySymbol} |
                   {action:"refreshMasterdata"}

    // state
    //const [{transactions, symbols, masterdata, timestamp, query}, dispatch] = useReducer((state:TState, action:TAction):TState => {
    const [{db, symbols, masterData, transactions, timestamp, query}, dispatch] = useReducer((state:TState, action:TAction):TState => {
        switch(action.action) {
            case "setDB":              return {...state, db:action.params}
            case "setTransactions":    return {...state, transactions:action.params}
            case "setQuery":           return {...state, query:action.params}
            case "setSymbols":         return {...state, symbols:new Set<string>(action.params), timestamp:Date.now()}
            case "setSymbolsAsSet":    return {...state, symbols:action.params, timestamp:Date.now()}
            case "setMasterData":      return {...state, masterData:action.params }
            case "refreshMasterdata" : return {...state, timestamp:Date.now()}
        }
    }, {
        db:null,
        symbols:new Set<string>(),
        masterData:{} as YFinQuoteBySymbol,
        transactions:[],
        timestamp:Date.now(),
        query:""
    })

    // fetch from indexDB
    //const db = useRef<DBManager<TTransaction>|void>()
    // effects
    useEffect(() => { // initialize db connection @ start
            mkDBManager<TTransaction>(DB_NAME_WEALTH, "transactions", DB_VERSION_WEALTH,[{indexName:"action", isUnique:false}, {indexName:"symbol", isUnique:false}])
                .then(dbManager => {
                    dispatch({action:"setDB", params:dbManager})
                    console.info("DB connection established")
                })
                .catch(reason => {
                    console.error(`Failed to establisch index DB connection, reason: ${reason}`)
                })
    },[])
    useEffect(() => { // fetch all transactions after db has been initialized
        if(db) {
            db.list()
              .then(list => dispatch({action:"setTransactions", params:list}))
        } else {
            console.warn("DB connection not established")
            //throw new Error("DB connection not established, try again later.")
        }
    },[db])
    useEffect(() => { // fetch symbols from index after db has been initialized
        if(db) {
            db.accessDBStore()
            .then(store => new Promise<string[]>((resolve, reject) => {
                                    const gotSymbols:string[] = []
                                    const request = store.index("symbol").openKeyCursor()
                                    request.onerror = () => {console.error(request.error); reject(new Error("Error fetching data from db, try again later. Check the application log for details."))}
                                    request.onsuccess = () => {
                                        const cursor = request.result
                                        if(cursor) {
                                            //const dataRequest = store.index("symbol").get(cursor.key)
                                            //dataRequest.onsuccess = () => {
                                            //    console.log(dataRequest.result)
                                            //}
                                            //dataRequest.onerror = () => {
                                            //    console.error(dataRequest.error)
                                            //}
                                            gotSymbols.push(cursor.key as string)
                                            cursor.continue()
                                        } else {

                                            resolve(gotSymbols)
                                        }
                                    } 
            }))
            .then(symbols => dispatch({action:"setSymbols", params:symbols}))
        } else {
            console.warn("DB connection not established")
            //throw new Error("DB connection not established, try again later.")
        }
    },[db])
    useEffect(() => { // fetch detaildata to all symbols, after symbols had been loaded and on refresh signal
        const _fetchBatch = (async (abortController:AbortController) => {
            const {MAX_BATCH_SIZE, fetchBatch} = getAssetBatch 
            const results:Promise<YFinQuoteResult[]>[] = []
            let curBatch:string[] = []
            symbols.forEach(s => {
                if(!(s in masterData)) {
                    if(curBatch.length === MAX_BATCH_SIZE) {
                        results.push(fetchBatch(curBatch, abortController))
                        curBatch = []
                    }
                    curBatch.push(s)
                }
            })
            if(curBatch.length > 0) {
                results.push(fetchBatch(curBatch, abortController))
            }
            return Promise.all(results)
                .then(batchResults => {
                    const newMasterData = batchResults.flatMap(batchResult => batchResult)
                                            .reduce((acc, m) => {
                                                acc[m.symbol] = m
                                                return acc
                                            },{} as YFinQuoteBySymbol)
                    dispatch({action:"setMasterData",params:{...masterData, ...newMasterData}})
                })
                .catch(reason => {
                    console.error(`Error happened: ${reason}`)
                    abortController.abort(reason)
                    throw new Error("Error happened accessing yfinance API, please try later. For Details refer to the application log.")
                })
            })
            const abortController = new AbortController()
            _fetchBatch(abortController)
            return () => abortController.abort()
    },[symbols,timestamp])


    // accregations use memo depending on transacitons
    // TODO if takes to long compute assyncronously and return Promise
    const aggregations = useMemo( () => 
        {
            return transactions.reduce( (acc, t) =>
            {
                if(!acc[t.symbol]) {
                    acc[t.symbol] = {symbol:t.symbol, holding:{count:0, avgPrice:0, fees:0, netValue:0},
                                                      sold:{count:0, avgPrice:0, fees:0, netValue:0}}
                }
                const assetPtr = acc[t.symbol]
                switch(t.action) {
                    case "buy": 
                        assetPtr.holding.count += t.amount
                        assetPtr.holding.netValue += t.amount * t.price
                        assetPtr.holding.fees += t.fees
                        if(assetPtr.currency && assetPtr.currency !== t.currency) {
                            console.error(`currencies dont match for ${t.symbol} (${assetPtr.currency} != ${t.currency})`)
                            throw new Error("curreny mismatch in data, cannot process data.")
                        }
                        assetPtr.currency = t.currency
                        if(assetPtr.kind && t.kind && assetPtr.kind !== t.kind) {
                            console.error(`kind dont match for ${t.symbol} (${assetPtr.kind} != ${t.kind})`)
                            throw new Error("kind mismatch in data, cannot process data.")
                        }
                        if(t.kind) {
                            assetPtr.kind = t.kind
                        }
                        break
                    case "sell": 
                        assetPtr.sold.count -= t.amount
                        assetPtr.sold.netValue += t.amount * t.price
                        assetPtr.sold.fees += t.fees
                        if(assetPtr.currency && assetPtr.currency !== t.currency) {
                            console.error(`currencies dont match for ${t.symbol} (${assetPtr.currency} != ${t.currency})`)
                            throw new Error("curreny mismatch in data, cannot process data.")
                        }
                        assetPtr.currency = t.currency
                        // deliberatelly 
                        break
                }
                assetPtr.holding.avgPrice = (assetPtr.holding.count > 0 ?
                                         (((assetPtr.holding.netValue || 0) + assetPtr.holding.fees) / assetPtr.holding.count)
                                         :
                                         0)
                assetPtr.sold.avgPrice = (assetPtr.sold.count > 0 ?
                                         (((assetPtr.sold.netValue || 0) + assetPtr.sold.fees) / assetPtr.sold.count)
                                         :
                                         0)
                return acc
            },{} as TWealthBySymbol)
        } ,[transactions])

    // search use memo and use callback depending on query and aggregations
    // TODO provide some kind of sorting
    const filteredMasterdata = useMemo(
        () => Object.entries<YFinQuoteResult>(masterData).filter(([,x])=>matchQuery<YFinQuoteResult>(x,query))
                    .reduce((acc,[k,v])=>{acc[k]=v;return acc},{} as YFinQuoteBySymbol),
        [masterData, query]
    )

    const search = useCallback( (query:string) => {
        dispatch({action:"setQuery", params:query})
    },[])

    // buy & sell use callback no dependencies
    // TODO on sell 1. shlould the symbol remain in the list when completly sold?
    function newTransacton(action:TTransaction["action"], order:TOrder, transactions:TTransaction[]) {
        const newTransaction =  {...order, action:action} as TTransaction 
        db?.add(newTransaction)
        .then(newId => {
            newTransaction.id = newId
            dispatch({action:"setTransactions", params:[...transactions, newTransaction]})
            if(!symbols.has(newTransaction.symbol)) {
                const newSymbols = symbols.add(newTransaction.symbol)
                dispatch({action:"setSymbolsAsSet", params:newSymbols})
                //getAsset(newTransaction.symbol, undefined)
                //    .then(((value) => {
                //            dispatch({action:"setMasterData", params:{...masterData, [value.symbol as keyof YFinQuoteBySymbol]:value}})
                //        }), 
                //        ((reason) => {
                //            console.error("Error happened, reason:", reason)
                //        }))
            }
        })
    }
    const buy = useCallback((order:TOrder) => {
        newTransacton("buy", order, transactions)
    },[transactions])
    const sell = useCallback((order:TOrder) => {
        newTransacton("sell", order, transactions)
    },[transactions])

    return {filteredMasterdata, aggregations, query, search, buy, sell}
}