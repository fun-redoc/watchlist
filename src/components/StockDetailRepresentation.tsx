import React from "react";
import { YFinQuoteResult, YFinAutocompleteResult } from "../hooks/useYFinApi";

//type YFinElem =
//  | (YFinAutocompleteResult & {
//      i: number;
//      fav: boolean;
//    } & YFinQuoteResult)
//  | null
//  | "loading";
export default function StockDetailRepresentation({
  props,
}: {
  //props: YFinElem;
  props: YFinQuoteResult | null | "loading"
}) {
  return (
    <>
      {props === "loading" ? (
        <span id="loading">loading ...</span>
      ) : props ? (
        <>
          <p>
            <label htmlFor="language">
              "language"<span id="language">{props.language}</span>
            </label>
          </p>
          <p>
            <label htmlFor="region">
              "region"<span id="region">{props.region}</span>
            </label>
          </p>
          <p>
            <label htmlFor="quoteType">
              "quoteType"<span id="quoteType">{props.quoteType}</span>
            </label>
          </p>
          <p>
            <label htmlFor="triggerable">
              "triggerable"<span id="triggerable">{props.triggerable}</span>
            </label>
          </p>
          <p>
            <label htmlFor="quoteSourceName">
              "quoteSourceName"
              <span id="quoteSourceName">{props.quoteSourceName}</span>
            </label>
          </p>
          <p>
            <label htmlFor="fiftyDayAverage">
              "fiftyDayAverage"
              <span id="fiftyDayAverage">{props.fiftyDayAverage}</span>
            </label>
          </p>
          <p>
            <label htmlFor="fiftyDayAverageChange">
              "fiftyDayAverageChange"
              <span id="fiftyDayAverageChange">
                {props.fiftyDayAverageChange}
              </span>
            </label>
          </p>
          <p>
            <label htmlFor="fiftyDayAverageChangePercent">
              "fiftyDayAverageChangePercent"
              <span id="fiftyDayAverageChangePercent">
                {props.fiftyDayAverageChangePercent}
              </span>
            </label>
          </p>
          <p>
            <label htmlFor="twoHundredDayAverage">
              "twoHundredDayAverage"
              <span id="twoHundredDayAverage">
                {props.twoHundredDayAverage}
              </span>
            </label>
          </p>
          <p>
            <label htmlFor="twoHundredDayAverageChange">
              "twoHundredDayAverageChange"
              <span id="twoHundredDayAverageChange">
                {props.twoHundredDayAverageChange}
              </span>
            </label>
          </p>
          <p>
            <label htmlFor="twoHundredDayAverageChangePercent">
              "twoHundredDayAverageChangePercent"
              <span id="twoHundredDayAverageChangePercent">
                {props.twoHundredDayAverageChangePercent}
              </span>
            </label>
          </p>
          <p>
            <label htmlFor="sourceInterval">
              "sourceInterval"
              <span id="sourceInterval">{props.sourceInterval}</span>
            </label>
          </p>
          <p>
            <label htmlFor="exchangeTimezoneName">
              "exchangeTimezoneName"
              <span id="exchangeTimezoneName">
                {props.exchangeTimezoneName}
              </span>
            </label>
          </p>
          <p>
            <label htmlFor="exchangeTimezoneShortName">
              "exchangeTimezoneShortName"
              <span id="exchangeTimezoneShortName">
                {props.exchangeTimezoneShortName}
              </span>
            </label>
          </p>
          <p>
            <label htmlFor="gmtOffSetMilliseconds">
              "gmtOffSetMilliseconds"
              <span id="gmtOffSetMilliseconds">
                {props.gmtOffSetMilliseconds}
              </span>
            </label>
          </p>
          <p>
            <label htmlFor="currency">
              "currency"<span id="currency">{props.currency}</span>
            </label>
          </p>
          <p>
            <label htmlFor="priceHint">
              "priceHint"<span id="priceHint">{props.priceHint}</span>
            </label>
          </p>
          <p>
            <label htmlFor="regularMarketChangePercent">
              "regularMarketChangePercent"
              <span id="regularMarketChangePercent">
                {props.regularMarketChangePercent}
              </span>
            </label>
          </p>
          <p>
            <label htmlFor="regularMarketDayRange">
              "regularMarketDayRange"
              <span id="regularMarketDayRange">
                {props.regularMarketDayRange}
              </span>
            </label>
          </p>
          <p>
            <label htmlFor="shortName">
              "shortName"<span id="shortName">{props.shortName}</span>
            </label>
          </p>
          <p>
            <label htmlFor="regularMarketPreviousClose">
              "regularMarketPreviousClose"
              <span id="regularMarketPreviousClose">
                {props.regularMarketPreviousClose}
              </span>
            </label>
          </p>
          <p>
            <label htmlFor="bid">
              "bid"<span id="bid">{props.bid}</span>
            </label>
          </p>
          <p>
            <label htmlFor="ask">
              "ask"<span id="ask">{props.ask}</span>
            </label>
          </p>
          <p>
            <label htmlFor="bidSize">
              "bidSize"<span id="bidSize">{props.bidSize}</span>
            </label>
          </p>
          <p>
            <label htmlFor="askSize">
              "askSize"<span id="askSize">{props.askSize}</span>
            </label>
          </p>
          <p>
            <label htmlFor="messageBoardId">
              "messageBoardId"
              <span id="messageBoardId">{props.messageBoardId}</span>
            </label>
          </p>
          <p>
            <label htmlFor="fullExchangeName">
              "fullExchangeName"
              <span id="fullExchangeName">{props.fullExchangeName}</span>
            </label>
          </p>
          <p>
            <label htmlFor="fiftyTwoWeekLowChange">
              "fiftyTwoWeekLowChange"
              <span id="fiftyTwoWeekLowChange">
                {props.fiftyTwoWeekLowChange}
              </span>
            </label>
          </p>
          <p>
            <label htmlFor="fiftyTwoWeekLowChangePercent">
              "fiftyTwoWeekLowChangePercent"
              <span id="fiftyTwoWeekLowChangePercent">
                {props.fiftyTwoWeekLowChangePercent}
              </span>
            </label>
          </p>
          <p>
            <label htmlFor="fiftyTwoWeekRange">
              "fiftyTwoWeekRange"
              <span id="fiftyTwoWeekRange">{props.fiftyTwoWeekRange}</span>
            </label>
          </p>
          <p>
            <label htmlFor="fiftyTwoWeekHighChange">
              "fiftyTwoWeekHighChange"
              <span id="fiftyTwoWeekHighChange">
                {props.fiftyTwoWeekHighChange}
              </span>
            </label>
          </p>
          <p>
            <label htmlFor="fiftyTwoWeekHighChangePercent">
              "fiftyTwoWeekHighChangePercent"
              <span id="fiftyTwoWeekHighChangePercent">
                {props.fiftyTwoWeekHighChangePercent}
              </span>
            </label>
          </p>
          <p>
            <label htmlFor="fiftyTwoWeekLow">
              "fiftyTwoWeekLow"
              <span id="fiftyTwoWeekLow">{props.fiftyTwoWeekLow}</span>
            </label>
          </p>
          <p>
            <label htmlFor="fiftyTwoWeekHigh">
              "fiftyTwoWeekHigh"
              <span id="fiftyTwoWeekHigh">{props.fiftyTwoWeekHigh}</span>
            </label>
          </p>
          <p>
            <label htmlFor="longName">
              "longName"<span id="longName">{props.longName}</span>
            </label>
          </p>
          <p>
            <label htmlFor="averageDailyVolume3Month">
              "averageDailyVolume3Month"
              <span id="averageDailyVolume3Month">
                {props.averageDailyVolume3Month}
              </span>
            </label>
          </p>
          <p>
            <label htmlFor="averageDailyVolume10Day">
              "averageDailyVolume10Day"
              <span id="averageDailyVolume10Day">
                {props.averageDailyVolume10Day}
              </span>
            </label>
          </p>
          <p>
            <label htmlFor="exchangeDataDelayedBy">
              "exchangeDataDelayedBy"
              <span id="exchangeDataDelayedBy">
                {props.exchangeDataDelayedBy}
              </span>
            </label>
          </p>
          <p>
            <label htmlFor="marketState">
              "marketState"<span id="marketState">{props.marketState}</span>
            </label>
          </p>
          <p>
            <label htmlFor="esgPopulated">
              "esgPopulated"<span id="esgPopulated">{props.esgPopulated}</span>
            </label>
          </p>
          <p>
            <label htmlFor="tradeable">
              "tradeable"<span id="tradeable">{props.tradeable}</span>
            </label>
          </p>
          <p>
            <label htmlFor="regularMarketPrice">
              "regularMarketPrice"
              <span id="regularMarketPrice">{props.regularMarketPrice}</span>
            </label>
          </p>
          <p>
            <label htmlFor="regularMarketTime">
              "regularMarketTime"
              <span id="regularMarketTime">{props.regularMarketTime}</span>
            </label>
          </p>
          <p>
            <label htmlFor="regularMarketChange">
              "regularMarketChange"
              <span id="regularMarketChange">{props.regularMarketChange}</span>
            </label>
          </p>
          <p>
            <label htmlFor="regularMarketOpen">
              "regularMarketOpen"
              <span id="regularMarketOpen">{props.regularMarketOpen}</span>
            </label>
          </p>
          <p>
            <label htmlFor="regularMarketDayHigh">
              "regularMarketDayHigh"
              <span id="regularMarketDayHigh">
                {props.regularMarketDayHigh}
              </span>
            </label>
          </p>
          <p>
            <label htmlFor="regularMarketDayLow">
              "regularMarketDayLow"
              <span id="regularMarketDayLow">{props.regularMarketDayLow}</span>
            </label>
          </p>
          <p>
            <label htmlFor="regularMarketVolume">
              "regularMarketVolume"
              <span id="regularMarketVolume">{props.regularMarketVolume}</span>
            </label>
          </p>
          <p>
            <label htmlFor="exchange">
              "exchange"<span id="exchange">{props.exchange}</span>
            </label>
          </p>
          <p>
            <label htmlFor="market">
              "market"<span id="market">{props.market}</span>
            </label>
          </p>
          <p>
            <label htmlFor="symbol">
              "symbol"<span id="symbol">{props.symbol}</span>
            </label>
          </p>
        </>
      ) : (
        <p> nothing to show</p>
      )}
    </>
  );
}
