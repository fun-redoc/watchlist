import { useEffect, useReducer, useRef } from "react";
import "./App.css";
import YFinApp from "./YFinApp";
import WatchApp from "./WatchApp";
import WealthApp from "./WealthApp";
import { Modal, ModalRef } from "./Modal";
import TransactionForm from "./TransactionForm";
import { TWatch, assign } from "../models/watch";
import { TOrder, useWealth } from "../provider/WealthProvider";
import { YFinAutocompleteResult, YFinQuoteResult } from "../hooks/useYFinApi";
import { useWatchlist } from "../provider/WatchListProvider";
import { useYFin } from "../provider/YFinProvider";
import Settings from "./Settings";
import React from "react";

enum AppMode {
  yfin,
  watch,
  wealth,
  settings,
}

export default function App() {
  const modalRef = useRef<ModalRef>(null);
  const wealthCtx = useWealth();
  const watchlistCtx = useWatchlist();
  const yfinCtx = useYFin();

  type TState = {
    appMode: AppMode;
  } & {
    buyFromWatchlist: TWatch | null;
  };
  type TAction =
    | { action: "setAppMode"; params: AppMode }
    | { action: "buyFromWatchlist"; params: TWatch }
    | { action: "finishBuyFromWatchlist" };
  const [{ appMode: currentAppMode, buyFromWatchlist }, dispatch] = useReducer(
    (state: TState, action: TAction) => {
      switch (action.action) {
        case "setAppMode":
          return { ...state, appMode: action.params };
        case "buyFromWatchlist":
          return { ...state, buyFromWatchlist: { ...action.params } }; // copy ... makes shure that state change triggers the rerender
        case "finishBuyFromWatchlist":
          return { ...state, buyFromWatchlist: null };
      }
    },
    {
      appMode: AppMode.yfin,
      buyFromWatchlist: null,
    },
  );


  useEffect(() => {
    if (buyFromWatchlist) modalRef?.current?.show();
    if (!buyFromWatchlist) modalRef?.current?.hide();
  }, [currentAppMode, buyFromWatchlist]);
  return (
    <>
      <YFinApp
        show={currentAppMode === AppMode.yfin}
        checkFavorite={(symbol: string) =>
          watchlistCtx.symbolToIDMap[symbol] !== undefined
        }
        showBuy={(selected) =>
          dispatch({
            action: "buyFromWatchlist",
            params: assign<YFinAutocompleteResult>(selected),
          })
        }
        addToWatch={async (selected) => {
          if (selected) {
            const t: TWatch = assign<YFinAutocompleteResult>(selected);
            try {
              watchlistCtx.add(t);
            } catch (error) {
              console.error(error);
              throw new Error("Someting wrong happened, try again later.");
            }
          }
        }}
        additionalHeaderElements={[
          <button
            key="yf-st"
            onClick={() =>
              dispatch({ action: "setAppMode", params: AppMode.settings })
            }
          >
            Settings
          </button>,
          <button
            key="yf-wa"
            onClick={() =>
              dispatch({ action: "setAppMode", params: AppMode.watch })
            }
          >
            Watchlist
          </button>,
          <button
            key="yf.we"
            onClick={() =>
              dispatch({ action: "setAppMode", params: AppMode.wealth })
            }
          >
            Wealthlist
          </button>,
        ]}
      />
      <WatchApp
        show={currentAppMode === AppMode.watch}
        showBuy={(selected) =>
          dispatch({ action: "buyFromWatchlist", params: selected })
        }
        getDetails={(symbol) => yfinCtx.getDetails(symbol)}
        additionalHeaderElements={[
          <button
            key="wa-st"
            onClick={() =>
              dispatch({ action: "setAppMode", params: AppMode.settings })
            }
          >
            Settings
          </button>,
          <button
            key="wa-yf"
            onClick={() =>
              dispatch({ action: "setAppMode", params: AppMode.yfin })
            }
          >
            YFinance Search
          </button>,
          <button
            key="wa-we"
            onClick={() =>
              dispatch({ action: "setAppMode", params: AppMode.wealth })
            }
          >
            Wealthlist
          </button>,
        ]}
      />
      <WealthApp
        show={currentAppMode === AppMode.wealth}
        showBuy={(selected) =>
          dispatch({
            action: "buyFromWatchlist",
            params: assign<YFinQuoteResult>(selected),
          })
        }
        additionalHeaderElements={[
          <button
            key="we-st"
            onClick={() =>
              dispatch({ action: "setAppMode", params: AppMode.settings })
            }
          >
            Settings
          </button>,
          <button
            key="we-yf"
            onClick={() =>
              dispatch({ action: "setAppMode", params: AppMode.yfin })
            }
          >
            YFinance Search
          </button>,
          <button
            key="we-wa"
            onClick={() =>
              dispatch({ action: "setAppMode", params: AppMode.watch })
            }
          >
            Watchlist
          </button>,
        ]}
      />
      <Settings
        show={currentAppMode === AppMode.settings}
        additionalHeaderElements={[
          <button
            key="st-yf"
            onClick={() =>
              dispatch({ action: "setAppMode", params: AppMode.yfin })
            }
          >
            YFinance Search
          </button>,
          <button
            key="st-we"
            onClick={() =>
              dispatch({ action: "setAppMode", params: AppMode.wealth })
            }
          >
            Wealthlist
          </button>,
          <button
            key="st-wa"
            onClick={() =>
              dispatch({ action: "setAppMode", params: AppMode.watch })
            }
          >
            Watchlist
          </button>,
        ]}
      />
      <Modal
        ref={modalRef}
        onHide={() => dispatch({ action: "finishBuyFromWatchlist" })}
      >
        {buyFromWatchlist ? (
          <TransactionForm
            action="buy"
            defaultCurrency={
              wealthCtx.aggregations[buyFromWatchlist.symbol]?.currency
            }
            symbol={buyFromWatchlist.symbol}
            longName={buyFromWatchlist.longName}
            shortName={buyFromWatchlist.shortName}
            kind={buyFromWatchlist.typeDisp}
            marketplace={buyFromWatchlist.exchDisp}
            onCancel={() => modalRef?.current?.hide()}
            onSubmit={(order) => {
              wealthCtx.buy(order as TOrder);
              modalRef?.current?.hide();
            }}
          />
        ) : (
          <h1>nothing selected.</h1>
        )}
      </Modal>
    </>
  );
}
