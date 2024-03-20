import { useCallback } from "react";
import { useSettings } from "../provider/SettingsProvider";

export default function useYFinApi(useMock = true): {
  autocomplete: (
    q: string | null,
    abortController?: AbortController,
  ) => Promise<YFinAutocompleteResult[]>;
  getAsset: (
    symbol: string,
    abortController?: AbortController,
  ) => Promise<YFinQuoteResult>;
  getAssetBatch: {
    MAX_BATCH_SIZE: number;
    fetchBatch: (
      batchOfSymbols: string[],
      abortController?: AbortController | undefined,
    ) => Promise<YFinQuoteResult[]>;
  };
} {
  const settingsCtx = useSettings();

  const api_autocomplete = useCallback(
    async (
      q: string | null,
      abortController?: AbortController,
    ): Promise<YFinAutocompleteResult[]> => {
      const headers: Headers = new Headers();
      headers.append("accept", "application/json");
      if (settingsCtx?.apiKey) {
        headers.append("X-API-KEY", settingsCtx?.apiKey);
      } else {
        console.error("no api key provided in settings.");
        throw new Error(
          "No api key for yfinance found in settings. Edit your settings and try again.",
        );
      }
      const service =
        "https://yfapi.net/v6/finance/autocomplete?region=DE&lang=de";
      const query = service + "&query=" + q;
      try {
        const response = await fetch(query, {
          method: "get",
          headers: headers,
          mode: "cors",
          cache: "force-cache",
          signal: abortController?.signal,
        });
        if (response.status === 401 || response.status === 403) {
          throw {
            status: response.status,
            statusText: response.statusText,
          } as AuthError;
        }
        if (!response.ok) {
          throw {
            status: response.status,
            statusText: response.statusText,
          } as ApiError;
        }
        const result = await response.json();
        if (Object.prototype.hasOwnProperty.call(result, "error")) {
          console.error(result);
          throw new Error(result);
        }
        return result["ResultSet"]["Result"];
      } catch (error) {
        console.error(error);
        throw new Error("failed to fetch data.");
      }
    },
    [settingsCtx?.apiKey],
  );

  if (useMock) {
    return {
      autocomplete: mock_autocomplete,
      getAsset: (symbol: string, abortController?: AbortController) =>
        mock_getAsset(symbol, abortController, 1500),
      getAssetBatch: mock_getAssetBatch(),
    };
  } else {
    return {
      autocomplete: api_autocomplete,
      getAsset: () => {
        throw new Error("not yet implemented");
      },
      getAssetBatch: {
        MAX_BATCH_SIZE: 0,
        fetchBatch: () => {
          throw new Error("not yet implemented");
        },
      },
    };
  }
}

// TODO replace mocks by real requests to api
//      cache requests to save money
export class AuthError {
  status: number | undefined = undefined;
  statusText: string | undefined = undefined;
}
export class ApiError {
  status: number | undefined = undefined;
  statusText: string | undefined = undefined;
}
export type YFinQuoteResult = {
  language: string;
  region: string;
  quoteType: string;
  triggerable: boolean;
  quoteSourceName: string;
  fiftyDayAverage: number; //
  fiftyDayAverageChange: number; //
  fiftyDayAverageChangePercent: number; //
  twoHundredDayAverage: number; //
  twoHundredDayAverageChange: number; //
  twoHundredDayAverageChangePercent: number; //
  sourceInterval: number;
  exchangeTimezoneName: string;
  exchangeTimezoneShortName: string;
  gmtOffSetMilliseconds: number;
  currency: string; //
  priceHint: number; //??
  regularMarketChangePercent: number; //
  regularMarketDayRange: string; //
  shortName: string;
  regularMarketPreviousClose: number; //
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  messageBoardId: string;
  fullExchangeName: string;
  fiftyTwoWeekLowChange: number;
  fiftyTwoWeekLowChangePercent: number;
  fiftyTwoWeekRange: string;
  fiftyTwoWeekHighChange: number;
  fiftyTwoWeekHighChangePercent: number;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekHigh: number;
  longName: string;
  averageDailyVolume3Month: number;
  averageDailyVolume10Day: number;
  exchangeDataDelayedBy: number;
  marketState: string;
  esgPopulated: boolean;
  tradeable: boolean;
  regularMarketPrice: number;
  regularMarketTime: number;
  regularMarketChange: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  exchange: string;
  market: string;
  symbol: string;
};

export type YFinAutocompleteResult = {
  symbol: string;
  name: string;
  exch: string;
  type: string;
  exchDisp: string;
  typeDisp: string;
};

export async function mock_autocomplete(
  q: string | null,
  abortController?: AbortController,
): Promise<YFinAutocompleteResult[]> {
  console.warn("using mock autocomplete");
  const response = {
    ResultSet: {
      Query: "Xtrackers MSCI World",
      Result: [
        {
          symbol: "XDWT.DE",
          name: "Xtrackers MSCI World Information Technology UCITS ETF",
          exch: "GER",
          type: "E",
          exchDisp: "XETRA",
          typeDisp: "ETF",
        },
        {
          symbol: "XDWH.DE",
          name: "Xtrackers MSCI World Health Care UCITS ETF",
          exch: "GER",
          type: "E",
          exchDisp: "XETRA",
          typeDisp: "ETF",
        },
        {
          symbol: "XDWD.DE",
          name: "Xtrackers MSCI World UCITS ETF",
          exch: "GER",
          type: "E",
          exchDisp: "XETRA",
          typeDisp: "ETF",
        },
        {
          symbol: "XDEV.DE",
          name: "Xtrackers MSCI World Value UCITS ETF",
          exch: "GER",
          type: "E",
          exchDisp: "XETRA",
          typeDisp: "ETF",
        },
        {
          symbol: "XDEQ.DE",
          name: "Xtrackers MSCI World Quality UCITS ETF",
          exch: "GER",
          type: "E",
          exchDisp: "XETRA",
          typeDisp: "ETF",
        },
        {
          symbol: "DBXW.DE",
          name: "Xtrackers MSCI World Swap UCITS ETF",
          exch: "GER",
          type: "E",
          exchDisp: "XETRA",
          typeDisp: "ETF",
        },
        {
          symbol: "XDWL.SG",
          name: "Xtrackers MSCI World UCITS ETF",
          exch: "STU",
          type: "M",
          exchDisp: "Stuttgart",
          typeDisp: "Fund",
        },
        {
          symbol: "XMWO.SW",
          name: "Xtrackers MSCI World Swap UCITS ETF",
          exch: "EBS",
          type: "E",
          exchDisp: "Swiss",
          typeDisp: "ETF",
        },
        {
          symbol: "XDWU.L",
          name: "Xtrackers MSCI World Utilities UCITS ETF",
          exch: "LSE",
          type: "E",
          exchDisp: "London",
          typeDisp: "ETF",
        },
        {
          symbol: "XZW0.DE",
          name: "Xtrackers MSCI World ESG UCITS ETF",
          exch: "GER",
          type: "E",
          exchDisp: "XETRA",
          typeDisp: "ETF",
        },
      ],
    },
  };
  //return response['ResultSet']['Result']
  return new Promise<YFinAutocompleteResult[]>((resolve) => {
    const timeoutHandel = setTimeout(() => {
      resolve(response["ResultSet"]["Result"]);
    }, 1500);
    abortController?.signal.addEventListener("abort", () => {
      clearTimeout(timeoutHandel);
    });
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function mock_getAsset(
  symbol: string,
  abortController?: AbortController,
  delay = 0,
): Promise<YFinQuoteResult> {
  console.warn("unsing mock getAsstet");
  const testResponse = ` {
    "quoteResponse": {
        "result": [
        {
            "language": "de-DE",
            "region": "DE",
            "quoteType": "ETF",
            "triggerable": false,
            "quoteSourceName": "Delayed Quote",
            "fiftyDayAverage": 46.69282,
            "fiftyDayAverageChange": 1.5761795,
            "fiftyDayAverageChangePercent": 0.033756357,
            "twoHundredDayAverage": 46.30738,
            "twoHundredDayAverageChange": 1.9616203,
            "twoHundredDayAverageChangePercent": 0.042360857,
            "sourceInterval": 15,
            "exchangeTimezoneName": "Europe/Berlin",
            "exchangeTimezoneShortName": "CET",
            "gmtOffSetMilliseconds": 3600000,
            "currency": "EUR",
            "priceHint": 2,
            "regularMarketChangePercent": 1.0551693,
            "regularMarketDayRange": "48.013 - 48.3",
            "shortName": "X(IE)-MSCI EM.MKTS 1CDL",
            "regularMarketPreviousClose": 47.765,
            "bid": 48.27,
            "ask": 48.291,
            "bidSize": 0,
            "askSize": 0,
            "messageBoardId": "finmb_268211348_lang_de",
            "fullExchangeName": "XETRA",
            "fiftyTwoWeekLowChange": 4.3689995,
            "fiftyTwoWeekLowChangePercent": 0.09952162,
            "fiftyTwoWeekRange": "43.9 - 48.812",
            "fiftyTwoWeekHighChange": -0.54299927,
            "fiftyTwoWeekHighChangePercent": -0.011124299,
            "fiftyTwoWeekLow": 43.9,
            "fiftyTwoWeekHigh": 48.812,
            "longName": "Xtrackers MSCI Emerging Markets UCITS ETF",
            "averageDailyVolume3Month": 58128,
            "averageDailyVolume10Day": 44880,
            "exchangeDataDelayedBy": 15,
            "marketState": "REGULAR",
            "esgPopulated": false,
            "tradeable": false,
            "regularMarketPrice": 48.269,
            "regularMarketTime": 1707908744,
            "regularMarketChange": 0.5040016,
            "regularMarketOpen": 48.013,
            "regularMarketDayHigh": 48.3,
            "regularMarketDayLow": 48.013,
            "regularMarketVolume": 12861,
            "exchange": "GER",
            "market": "de_market",
            "symbol": "${symbol}"
        }
        ],
        "error": null
    }
    }`;
  return new Promise((resolve) => {
    if (delay > 0) {
      const timeoutHandel = setTimeout(() => {
        resolve(JSON.parse(testResponse)["quoteResponse"]["result"].pop());
      }, delay);
      abortController?.signal.addEventListener("abort", () => {
        clearTimeout(timeoutHandel);
      });
    } else {
      resolve(JSON.parse(testResponse)["quoteResponse"]["result"].pop());
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function mock_getAssetBatch() {
  const MAX_BATCH_SIZE = 1;
  async function fetchBatch(
    batchOfSymbols: string[],
    abortController?: AbortController,
  ): Promise<YFinQuoteResult[]> {
    console.warn("unsing mock getAsstetBatch");
    if (batchOfSymbols.length > MAX_BATCH_SIZE) {
      console.error(
        `batch is too big, max ${MAX_BATCH_SIZE} expected but got ${batchOfSymbols.length}`,
      );
      throw new Error(
        "An error happened, try again later. For details check application log",
      );
    }
    return Promise.all(
      batchOfSymbols.flatMap(async (s) => {
        return new Promise<YFinQuoteResult>((resolve, reject) => {
          const hTimeout = setTimeout(() => {
            // simulate netword lattency on each batch
            mock_getAsset(s, abortController).then(
              (success) => resolve(success),
              (fail) => reject(fail),
            );
          }, 300);
          abortController?.signal.addEventListener("abort", () =>
            clearTimeout(hTimeout),
          );
        });
      }),
    );
  }
  return { MAX_BATCH_SIZE, fetchBatch };
}
