import { useState } from "react";
import "./App.css";
import StockDetail from "./StockDetail";
import StockList from "./StockList";
import StockSearch from "./StockSearch";
import { YFinAutocompleteResult, YFinQuoteResult } from "../hooks/useYFinApi";
import StockItemRepresentation from "./StockItemRepresentation";
import MainLayout from "./MainLayout";
import { useYFin } from "../provider/YFinProvider";
import StockDetailRepresentation from "./StockDetailRepresentation";
import React from "react";

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
  const [selected, setSelected] = useState<YFinElem | "loading" | null>(null);
  const [details, setDetails] = useState<YFinQuoteResult | null>(null);

  return (
    <MainLayout show={show}>
      <>
        <div className="mainMenu">
          {additionalHeaderElements}
        </div>
        <h1>Search Stock</h1>
        <StockSearch onSearch={yfinCtx.search} />
      </>

      {yfinCtx.queryResult === "loading" ? (
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
            yfinCtx.getDetails(s.symbol).then(
              (assetDetails) => {
                setSelected(s);
                setDetails(assetDetails || null);
              },
              (error) => {
                console.error(error);
                setSelected(s);
                setDetails(null);
              },
            );
          }}
        />
      )}
      {selected ? (
        selected === "loading" ? (
          <p>loading...</p>
        ) : showBuy ? (
          <StockDetail
            value={{ ...selected, ...details }}
            representation={(s) => <StockDetailRepresentation props={s as YFinQuoteResult} />}
            onAddToWatch={addToWatch}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onAddToWealth={showBuy}
          />
        ) : (
          <StockDetail
            value={{ ...selected, ...details }}
            representation={(s) => <StockDetailRepresentation props={s as YFinQuoteResult} />}
            onAddToWatch={addToWatch}
          />
        )
      ) : (
        <h1>nothing selected</h1>
      )}
    </MainLayout>
  );
}
