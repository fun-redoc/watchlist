import { useCallback, useState } from "react";
import "./App.css";
import StockDetail from "./StockDetail";
import StockList from "./StockList";
import StockSearch from "./StockSearch";
import StockItemRepresentation from "./StockItemRepresentation";
import StockDetailRepresentation from "./StockDetailRepresentation";
import MainLayout from "./MainLayout";
import { TWatch } from "../models/watch";
import { useWatchlist } from "../provider/WatchListProvider";
import { YFinQuoteResult } from "../hooks/useYFinApi";
import { useIndexDB } from "../hooks/useIndexDB";
import React from "react";

const DB_NAME_CACHE = "cacheDB";
const DB_VERSION_CACHE = 1;
function doCached<RT, FT extends (...args: any) => Promise<RT>>(
  f: FT,
  params: Parameters<FT>,
  cacheParams: { timeOutMillis: number } = { timeOutMillis: 10000},
): Promise<RT> {
  return new Promise<RT>((resolve, reject) => {
    const requestDB = window.indexedDB.open(DB_NAME_CACHE, DB_VERSION_CACHE);
    requestDB.onupgradeneeded = () => {
      const db = requestDB.result;
      db.createObjectStore("cache", { keyPath: "key" });
    };
    requestDB.onsuccess = () => {
      const db = requestDB.result;
      const transaction = db.transaction(["cache"], "readonly");
      const objectStore = transaction.objectStore("cache");
      const request = objectStore.get(params.toString());
      request.onsuccess = async () => {
        const result = request.result;
        if (result) {
          if (Date.now() - result.time < cacheParams.timeOutMillis) {
            console.info("Data fetched from cache")
            resolve( result as RT)
            return
          }
        }
        const promise = f(...params);
        return promise
          .catch(reason => {
            console.error("Failed to fatch value, with reason:", reason)
            reject(reason)
          })
          .then(value => {
            if(value) {
              const transactionWrite = db.transaction(["cache"], "readwrite");
              const objectStoreWrtie = transactionWrite.objectStore("cache");
              const requestPut = objectStoreWrtie.put({ ...value, time: Date.now(), key: params.toString() });
              transactionWrite.commit()
              requestPut.onerror = ()=> {console.error(requestPut.error)}
              requestPut.onsuccess = ()=> {console.info("Data stored in cache.")}
              resolve(value)
            } else {
              reject("no result fetched")
            } 
          })
      };
      request.onerror = () => {
        console.error("No cache available, error:", request.error);
        f(...params)
        .catch(reason=>reject(reason))
        .then(result=> {
                          if(result) {
                            resolve(result)
                          } else {
                            reject("no result fetched")
                          } 
                        })
      };
    };
    requestDB.onerror = () => {
      console.error("No cache DB available, error:", requestDB.error);
      f(...params)
        .catch(reason=>reject(reason))
        .then(result=> {
                          if(result) {
                            resolve(result)
                          } else {
                            reject("no result fetched")
                          } 
                        })
    };
  })
}

export default function WatchApp({
  show,
  showBuy,
  additionalHeaderElements,
  getDetails,
}: { show: boolean } & { showBuy?: (selected: TWatch) => void } & {
  additionalHeaderElements?: JSX.Element[];
} & { getDetails: (symbol: string) => Promise<YFinQuoteResult> }) {
  const watchlistCtx = useWatchlist();
  const [selected, setSelected] = useState<TWatch | null>(null);
  const [details, setDetails] = useState<YFinQuoteResult | "loading" | null>(
    null,
  );

  const onDelete = (s: TWatch) => {
    console.log("on Delete", s);
    watchlistCtx.del(s);
  };

  return (
    <MainLayout show={show}>
      <>
        <StockSearch
          onSearch={(q) => {
            watchlistCtx.search(q);
          }}
        />
        {additionalHeaderElements}
      </>

      <StockList<TWatch>
        list={watchlistCtx.watchlist}
        stockRepresentation={
          (s) => (
            <StockItemRepresentation
              kind={s.typeDisp}
              symbol={s.symbol}
              name={s.name}
              fav={true}
            />
          ) /* in watchlists is same as fav thus fav=true here */
        }
        onSelect={async (s) => {
          setSelected(s);
          setDetails("loading");
          const details = await doCached<YFinQuoteResult, typeof getDetails>(getDetails, [s.symbol]);
          setDetails(details);
        }}
        onDelete={onDelete}
      />
      {selected ? (
        showBuy ? (
          <StockDetail
            value={details}
            representation={(s) => <StockDetailRepresentation props={s} />}
            onAddToWealth={(s) => showBuy(s)}
          />
        ) : (
          <StockDetail
            value={{ details }}
            representation={(s) => <StockDetailRepresentation props={s} />}
          />
        )
      ) : (
        <h1>nothing selected</h1>
      )}
    </MainLayout>
  );
}
