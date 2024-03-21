import { useState } from "react";
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
import React from "react";
import useCache from "../hooks/useCache";


export default function WatchApp({
  show,
  showBuy,
  additionalHeaderElements,
  getDetails,
}: { show: boolean } & { showBuy?: (selected: TWatch) => void } & {
  additionalHeaderElements?: JSX.Element[];
} & { getDetails: (symbol: string) => Promise<YFinQuoteResult> }) {
  const getDetailsCached = useCache<YFinQuoteResult, typeof getDetails>(getDetails,{timeOutMillis:1000*60*60})
  const watchlistCtx = useWatchlist();
  const [selected, setSelected] = useState<TWatch | null>(null);
  const [details, setDetails] = useState<YFinQuoteResult | null | "loading">(
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
          const details = await getDetailsCached([s.symbol]) // doCached<YFinQuoteResult, typeof getDetails>(getDetails, [s.symbol]);
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
            value={ details}
            representation={(s) => <StockDetailRepresentation props={s} />}
          />
        )
      ) : (
        <h1>nothing selected</h1>
      )}
    </MainLayout>
  );
}
