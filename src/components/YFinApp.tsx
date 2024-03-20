import { useState } from "react";
import "./App.css";
import StockDetail from "./StockDetail";
import StockList from "./StockList";
import StockSearch from "./StockSearch";
import { YFinAutocompleteResult, YFinQuoteResult } from "../hooks/useYFinApi";
import StockItemRepresentation from "./StockItemRepresentation";
import MainLayout from "./MainLayout";
import { useYFin } from "../provider/YFinProvider";
import { useWatchlist } from "../provider/WatchListProvider";
import { TWatch, assign } from "../models/watch";
import StockDetailRepresentation from "./StockDetailRepresentation";

type YFinElem = YFinAutocompleteResult & { i: number; fav: boolean };
export default function YFinApp({
  show,
  checkFavorite,
  showBuy,
  addToWatch,
  additionalHeaderElements,
}: { show: boolean } & { checkFavorite?: (symbol: string) => boolean } & {
  showBuy?: (selected: YFinAutocompleteResult) => void;
} & { addToWatch?: (selected: YFinAutocompleteResult) => void } & {
  additionalHeaderElements?: JSX.Element[];
}) {
  const yfinCtx = useYFin();
  const watchlistCtx = useWatchlist();
  const [selected, setSelected] = useState<YFinElem | "loading" | null>(null);
  const [details, setDetails] = useState<YFinQuoteResult | null>(null);

  return (
    <MainLayout show={show}>
      <>
        <StockSearch onSearch={yfinCtx.search} />
        {additionalHeaderElements}
      </>

      {yfinCtx.queryResult == "loading" ? (
        <p>loading...</p>
      ) : (
        <StockList<YFinElem>
          list={yfinCtx.queryResult?.map((a, i) => {
            return {
              ...a,
              i: i,
              fav: (checkFavorite && checkFavorite(a.symbol)) || false,
            };
          })}
          stockRepresentation={(s) => (
            <StockItemRepresentation
              kind={s.typeDisp}
              symbol={s.symbol}
              name={s.name}
              fav={s.fav}
            />
          )}
          onSelect={async (s) => {
            setSelected("loading");
            //const assetDetails = await yfinCtx.getDetails(s as YFinAutocompleteResult)
            //setSelected(s)
            //setDetails(assetDetails)
            yfinCtx
              .getDetails(s as YFinAutocompleteResult)
              .then(
                (assetDetails) => {
                  setSelected(s);
                  setDetails(assetDetails);
                },
                (error) => {
                  console.error(error);
                  setSelected(s);
                  setDetails(null);
                },
              )
              .catch((error) => {
                console.error(error);
                setSelected(s);
                setDetails(null);
              });
          }}
        />
      )}
      {selected ? (
        selected === "loading" ? (
          <p>loading...</p>
        ) : showBuy ? (
          <StockDetail
            value={{ ...selected, ...details }}
            representation={(s) => <StockDetailRepresentation props={s} />}
            onAddToWatch={(s) => {
              if (addToWatch && s) {
                addToWatch(s);
              }
            }}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onAddToWealth={(s) => {
              showBuy(s);
            }}
          />
        ) : (
          <StockDetail
            value={{ ...selected, ...details }}
            representation={(s) => <>{s && s.shortName}</>}
            onAddToWatch={async (s) => {
              if (s) {
                const t: TWatch = assign<YFinElem>(s);
                try {
                  watchlistCtx.add(t);
                } catch (error) {
                  console.error(error);
                  throw new Error("Someting wrong happened, try again later.");
                }
              }
            }}
          />
        )
      ) : (
        <h1>nothing selected</h1>
      )}
    </MainLayout>
  );
}
