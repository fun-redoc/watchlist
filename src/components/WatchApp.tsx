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

const DB_NAME_CACHE = "cacheDB";
const DB_VERSION_CACHE = 1;
function doCached<RT, FT extends (...args: any) => Promise<RT>>(
  f: FT,
  params: Parameters<FT>,
  cacheParams: { timeOutMillis: number } = { timeOutMillis: 1000 },
): Promise<RT> {
  const requestDB = window.indexedDB.open(DB_NAME_CACHE, DB_VERSION_CACHE);
  requestDB.onupgradeneeded = () => {
    const db = requestDB.result;
    db.createObjectStore("cache", { keyPath: "key" });
  };
  requestDB.onsuccess = () => {
    const db = requestDB.result;
    const transaction = db.transaction(["cache"], "readwrite");
    const objectStore = transaction.objectStore("cache");
    const request = objectStore.get(params.toString());
    request.onsuccess = () => {
      const result = request.result;
      if (result && result.value) {
        if (Date.now() - result.value.time < cacheParams.timeOutMillis) {
          return result.value.value;
        }
      }
      const value = f(...params);
      objectStore.put({ ...value, time: Date.now(), key: params.toString() });
      return value;
    };
    request.onerror = () => {
      console.error("No cache available, error:", request.error);
      return f(...params);
    };
  };
  requestDB.onerror = () => {
    console.error("No cache DB available, error:", requestDB.error);
    return f(...params);
  };
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
          const details = await doCached(getDetails, s.symbol);
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
