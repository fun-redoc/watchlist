/* eslint-disable @typescript-eslint/no-loss-of-precision */
import { useCallback, useMemo } from "react";
import { useSettings } from "../provider/SettingsProvider";

export default function useYFinApi(useMock = true): {
  autocomplete: (
    q: string | null,
    abortController?: AbortController,
  ) => Promise<YFinAutocompleteResult[]>;
  getAsset: (
    symbol: string,
    abortController?: AbortController,
  ) => Promise<YFinQuoteResult|undefined>;
  getAssetBatch: {
    MAX_BATCH_SIZE: number;
    fetchBatch: (
      batchOfSymbols: string[],
      abortController?: AbortController,
    ) => Promise<YFinQuoteResult[]>;
  };
  getChart: (
    symbol: string,
    chartParams:ChartParams,
    abortController?: AbortController,
  ) => Promise<YFinChartResult>;
} {
  const settingsCtx = useSettings();
  console.log(`useYFinApi settingsCtx: ${settingsCtx?.apiKey}`)

  const api_request = useCallback(async <T>(queryParams:string, abortController?:AbortController) : Promise<T> => {
      const headers: Headers = new Headers();
      headers.append("accept", "application/json");
      if (settingsCtx?.apiKey) {
        console.log("api_request setting api key")
        headers.append("X-API-KEY", settingsCtx?.apiKey);
      } else {
        console.error("no api key provided in settings.");
        throw new Error(
          "No api key for yfinance found in settings. Edit your settings and try again.",
        );
      }
      const service = `https://yfapi.net/`
      //const query = service + `chart/${symbol}?region=DE&lang=de&range=max&interval=1d&events=div,split`;
      const query = service + queryParams
      console.log("api_request query", query)
      console.log("api_request headers", JSON.stringify(headers) )
      headers.forEach((v,k) => console.log(`header key ${k} : value ${v}`))
      try {
        const response = await fetch(query, {
          method: "get",
          headers: headers,
          mode: "cors",
          cache: "force-cache",
          signal: abortController?.signal,
        });
        console.log("api_request response", response)
        if (response.status === 401 || response.status === 403) {
          console.log("api_request response nok")
          throw {
            status: response.status,
            statusText: response.statusText,
          } as AuthError;
        }
        if (!response.ok) {
          console.log("api_request response ok")
          throw {
            status: response.status,
            statusText: response.statusText,
          } as ApiError;
        }
        const result = await response.json();
        console.log("api_request result", result)
        if (Object.prototype.hasOwnProperty.call(result, "error")) {
          console.log("api_request result hase error branch")
          console.error(result.error);
          throw new Error(result.error);
        }
        return result;
      } catch (error) {
        console.log("api_request error caught for query", query)
        console.error(error);
        throw new Error("failed to fetch data.");
      }
  }, [settingsCtx?.apiKey])

  // Refactor: result[0] takes the first result, but the index is also relevant in quote and adjquote...
  //           this can lead to mistakes, better solution could be constructing an own appropirate data structure
  const api_getChart = useCallback(async (symbol:string, chartParams:ChartParams, abortController?:AbortController) : Promise<YFinChartResult> => {
      const query = `v8/finance/chart/${symbol}?region=DE&lang=de&range=${chartParams.range}&interval=${chartParams.interval}${chartParams.event ? "&events=" + chartParams.event : ""}`;
      return api_request<YFinChartResponse>(query, abortController)
        .then(response => response.chart.result[0] )
  },[api_request])

  const api_getAssetBatch = useCallback( () => {
    const MAX_BATCH_SIZE = 10;
    async function api_fetchBatch(batchOfSymbols:string[], abortController?:AbortController) : Promise<YFinQuoteResult[]> {
        const symbols=batchOfSymbols.join(',')
        const query = `v6/finance/quote?region=DE&lang=de&symbols=${encodeURIComponent(symbols)}`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return api_request<any>(query, abortController)
          .then(response => response["quoteResponse"]["result"] )
    }
    return { MAX_BATCH_SIZE, fetchBatch:api_fetchBatch };
  },[api_request])

  // Refactor: do I really need useCallback here, maybebetter in calling Provider context
  const api_autocomplete = useCallback(
    async (
      q: string | null,
      abortController?: AbortController,
    ): Promise<YFinAutocompleteResult[]> => {

      const query = `v6/finance/autocomplete?region=DE&lang=de&query=${q}`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return api_request<any>(query, abortController)
              .then(response => response["ResultSet"]["Result"] )
    },[api_request])

  return useMemo<ReturnType<typeof useYFinApi>>(() => {
    if (useMock) { 
      return {
        autocomplete: mock_autocomplete,
        getAsset: (symbol: string, abortController?: AbortController) =>
          mock_getAsset(symbol, abortController, 1500),
        getAssetBatch: mock_getAssetBatch(),
        getChart: mock_getChart
      }
    } else {
      return {
        autocomplete: api_autocomplete,
        getAsset: (symbol:string, abortController?:AbortController) => {
          return api_getAssetBatch().fetchBatch([symbol], abortController)
                  .then(arrResult => arrResult.pop())
        },
        getAssetBatch: api_getAssetBatch(),
        getChart: api_getChart
      }
    }
  },[api_autocomplete, api_getAssetBatch, api_getChart, useMock])
}

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

export const _range= ["1d" ,"5d" ,"1d" ,"5d" ,"1mo","3mo","6mo","1y" ,"5y" ,"10y","ytd","max"] as const
export const _interval= ["1m"  ,"5m"  ,"15m" ,"1d"  ,"1wk" ,"1mo"] as const
export const _event= ["div" , "split" , "div,split", null] as const
export type ChartParams = {
  //range: "1d" |"5d" |"1d" |"5d" |"1mo"|"3mo"|"6mo"|"1y" |"5y" |"10y"|"ytd"|"max"
  //interval: "1m"  |"5m"  |"15m" |"1d"  |"1wk" |"1mo"
  //event: "div" | "split" | null
  range: typeof _range[number]
  interval: typeof _interval[number]
  event: typeof _event[number]
}
 interface YFinChartResponse {
  chart: Chart
}

 interface Chart {
  result: YFinChartResult[]
  error: unknown
}

export interface YFinChartResult {
  meta: YFinChartMeta
  timestamp: number[]
  indicators: YFinChartIndicators
}

export interface YFinChartMeta {
  currency: string
  symbol: string
  exchangeName: string
  instrumentType: string
  firstTradeDate: number
  regularMarketTime: number
  hasPrePostMarketData: boolean
  gmtoffset: number
  timezone: string
  exchangeTimezoneName: string
  regularMarketPrice: number
  chartPreviousClose: number
  priceHint: number
  currentTradingPeriod: CurrentTradingPeriod
  dataGranularity: string
  range: string
  validRanges: string[]
}

export interface CurrentTradingPeriod {
  pre: Pre
  regular: Regular
  post: Post
}

export interface Pre {
  timezone: string
  end: number
  start: number
  gmtoffset: number
}

export interface Regular {
  timezone: string
  end: number
  start: number
  gmtoffset: number
}

export interface Post {
  timezone: string
  end: number
  start: number
  gmtoffset: number
}

export interface YFinChartIndicators {
  quote: Quote[]
  adjclose: Adjclose[]
}

export interface Quote {
  open: number[]
  close: number[]
  high: number[]
  volume: number[]
  low: number[]
}

export interface Adjclose {
  adjclose: number[]
}


export async function mock_getChart(symbol:string, params:ChartParams, abortController?:AbortController) : Promise<YFinChartResult> {
  console.warn("using mock getChart");
  const response = 
 {
  "chart": {
    "result": [
      {
        "meta": {
          "currency": "EUR",
          "symbol": symbol,
          "exchangeName": "GER",
          "instrumentType": "ETF",
          "firstTradeDate": 1408086000,
          "regularMarketTime": 1711113869,
          "hasPrePostMarketData": false,
          "gmtoffset": 3600,
          "timezone": "CET",
          "exchangeTimezoneName": "Europe/Berlin",
          "regularMarketPrice": 99.624,
          "chartPreviousClose": 33.81,
          "priceHint": 2,
          "currentTradingPeriod": {
            "pre": {
              "timezone": "CET",
              "end": 1711094400,
              "start": 1711087200,
              "gmtoffset": 3600
            },
            "regular": {
              "timezone": "CET",
              "end": 1711125000,
              "start": 1711094400,
              "gmtoffset": 3600
            },
            "post": {
              "timezone": "CET",
              "end": 1711135800,
              "start": 1711125000,
              "gmtoffset": 3600
            }
          },
          "dataGranularity": "1mo",
          "range": "max",
          "validRanges": [
            "1d",
            "5d",
            "1mo",
            "3mo",
            "6mo",
            "1y",
            "2y",
            "5y",
            "10y",
            "ytd",
            "max"
          ]
        },
        "timestamp": [
          1409522400,
          1412114400,
          1414796400,
          1417388400,
          1420066800,
          1422745200,
          1425164400,
          1427839200,
          1430431200,
          1433109600,
          1435701600,
          1438380000,
          1441058400,
          1443650400,
          1446332400,
          1448924400,
          1451602800,
          1454281200,
          1456786800,
          1459461600,
          1462053600,
          1464732000,
          1467324000,
          1470002400,
          1472680800,
          1475272800,
          1477954800,
          1480546800,
          1483225200,
          1485903600,
          1488322800,
          1490997600,
          1493589600,
          1496268000,
          1498860000,
          1501538400,
          1504216800,
          1506808800,
          1509490800,
          1512082800,
          1514761200,
          1517439600,
          1519858800,
          1522533600,
          1525125600,
          1527804000,
          1530396000,
          1533074400,
          1535752800,
          1538344800,
          1541026800,
          1543618800,
          1546297200,
          1548975600,
          1551394800,
          1554069600,
          1556661600,
          1559340000,
          1561932000,
          1564610400,
          1567288800,
          1569880800,
          1572562800,
          1575154800,
          1577833200,
          1580511600,
          1583017200,
          1585692000,
          1588284000,
          1590962400,
          1593554400,
          1596232800,
          1598911200,
          1601503200,
          1604185200,
          1606777200,
          1609455600,
          1612134000,
          1614553200,
          1617228000,
          1619820000,
          1622498400,
          1625090400,
          1627768800,
          1630447200,
          1633039200,
          1635721200,
          1638313200,
          1640991600,
          1643670000,
          1646089200,
          1648764000,
          1651356000,
          1654034400,
          1656626400,
          1659304800,
          1661983200,
          1664575200,
          1667257200,
          1669849200,
          1672527600,
          1675206000,
          1677625200,
          1680300000,
          1682892000,
          1685570400,
          1688162400,
          1690840800,
          1693519200,
          1696111200,
          1698793200,
          1701385200,
          1704063600,
          1706742000,
          1709247600,
          1711113869
        ],
        "indicators": {
          "quote": [
            {
              "open": [
                35.599998474121094,
                35.70000076293945,
                36.2400016784668,
                36.97999954223633,
                38.150001525878906,
                39.540000915527344,
                42.31999969482422,
                42.959999084472656,
                42.83000183105469,
                43.77000045776367,
                41.95000076293945,
                43.099998474121094,
                38.779998779296875,
                38.70000076293945,
                41.470001220703125,
                43.470001220703125,
                40.709999084472656,
                39.040000915527344,
                38.75,
                39.06999969482422,
                39.779998779296875,
                41.130001068115234,
                40.880001068115234,
                42.400001525878906,
                42.650001525878906,
                42.369998931884766,
                42.58000183105469,
                44.5,
                46.029998779296875,
                46.11000061035156,
                48.439998626708984,
                48.310001373291016,
                48.040000915527344,
                47.52000045776367,
                47.040000915527344,
                46.650001525878906,
                46.279998779296875,
                47.720001220703125,
                49.369998931884766,
                49.040000915527344,
                49.630001068115234,
                50.4640007019043,
                48.970001220703125,
                47.46799850463867,
                49.292999267578125,
                51.19200134277344,
                50.6619987487793,
                52.650001525878906,
                53.56399917602539,
                54.08000183105469,
                51,
                52.61800003051758,
                47.176998138427734,
                51.029998779296875,
                53.11600112915039,
                54.54199981689453,
                56.15399932861328,
                53.0359992980957,
                56.555999755859375,
                57.417999267578125,
                56.60200119018555,
                58.763999938964844,
                58.66400146484375,
                61.15800094604492,
                61.93000030517578,
                62.26599884033203,
                57.74399948120117,
                48.43299865722656,
                55.310001373291016,
                56.72600173950195,
                57.95000076293945,
                58.20800018310547,
                61.060001373291016,
                60.39799880981445,
                58.832000732421875,
                64.85600280761719,
                65.3219985961914,
                65.96800231933594,
                68.30000305175781,
                71.96399688720703,
                73.43399810791016,
                73.29199981689453,
                76.70800018310547,
                78.35800170898438,
                80.54000091552734,
                77.4540023803711,
                83.14800262451172,
                83.5479965209961,
                86.60199737548828,
                82.40599822998047,
                80.69999694824219,
                83.98999786376953,
                80.83799743652344,
                79.7040023803711,
                73.57599639892578,
                82.00800323486328,
                79.69200134277344,
                74.48400115966797,
                79.50599670410156,
                80.80400085449219,
                75.56999969482422,
                78.79399871826172,
                78.93800354003906,
                79.68000030517578,
                79.30599975585938,
                81.7239990234375,
                84.80400085449219,
                86.6760025024414,
                85.8479995727539,
                84.4520034790039,
                81.89600372314453,
                86.83799743652344,
                89.95999908447266,
                92.95999908447266,
                97.01599884033203,
                99.6240005493164
              ],
              "close": [
                35.81999969482422,
                36.209999084472656,
                37.220001220703125,
                37.68000030517578,
                39.619998931884766,
                42.130001068115234,
                43.380001068115234,
                42.560001373291016,
                43.400001525878906,
                41.7599983215332,
                42.9900016784668,
                39.4900016784668,
                38.150001525878906,
                41.83000183105469,
                43.380001068115234,
                41.63999938964844,
                38.81999969482422,
                38.939998626708984,
                39.470001220703125,
                39.47999954223633,
                41.040000915527344,
                40.529998779296875,
                42.2599983215332,
                42.369998931884766,
                42.29999923706055,
                42.58000183105469,
                44.849998474121094,
                46.02000045776367,
                45.66999816894531,
                48.029998779296875,
                48.2400016784668,
                47.93000030517578,
                47.34000015258789,
                46.95000076293945,
                46.540000915527344,
                46.099998474121094,
                47.47999954223633,
                49.119998931884766,
                49.04999923706055,
                49.630001068115234,
                50.20800018310547,
                49.2760009765625,
                47.46799850463867,
                49.292999267578125,
                51.130001068115234,
                51.236000061035156,
                52.512001037597656,
                53.47999954223633,
                53.86800003051758,
                51.231998443603516,
                51.459999084472656,
                47.176998138427734,
                50.88199996948242,
                52.874000549316406,
                54.178001403808594,
                56.15399932861328,
                53.49399948120117,
                55.529998779296875,
                57.61000061035156,
                56.62200164794922,
                58.47200012207031,
                58.402000427246094,
                60.9900016784668,
                61.93000030517578,
                62.06399917602539,
                56.65999984741211,
                50.44599914550781,
                55.310001373291016,
                56.72600173950195,
                57.65999984741211,
                57.395999908447266,
                60.88399887084961,
                60.20399856567383,
                58.52399826049805,
                64.34200286865234,
                65.3219985961914,
                65.61399841308594,
                67.76599884033203,
                71.8499984741211,
                73.21600341796875,
                73.04000091552734,
                76.49600219726562,
                77.98400115966797,
                80.28800201416016,
                78.7760009765625,
                82.83999633789062,
                83.34600067138672,
                86.70600128173828,
                82.0260009765625,
                80.55400085449219,
                84.302001953125,
                82.09600067138672,
                79.23400115966797,
                74.2239990234375,
                81.73200225830078,
                80.33200073242188,
                75.66999816894531,
                79.1520004272461,
                79.37000274658203,
                74.85399627685547,
                78.52200317382812,
                79.04399871826172,
                79.10399627685547,
                79.30599975585938,
                81.34200286865234,
                84.42400360107422,
                86.40799713134766,
                85.91400146484375,
                84.5199966430664,
                81.53600311279297,
                86.39399719238281,
                89.95999908447266,
                93.01399993896484,
                96.45600128173828,
                99.59200286865234,
                99.6240005493164
              ],
              "high": [
                36.4900016784668,
                36.220001220703125,
                37.380001068115234,
                37.93000030517578,
                40.88999938964844,
                42.189998626708984,
                44.0099983215332,
                44.970001220703125,
                44.310001373291016,
                43.77000045776367,
                44.2599983215332,
                43.650001525878906,
                39.869998931884766,
                42.11000061035156,
                43.5,
                43.720001220703125,
                41.099998474121094,
                39.04999923706055,
                40.04999923706055,
                41,
                41.310001373291016,
                41.13999938964844,
                42.720001220703125,
                42.72999954223633,
                42.88999938964844,
                43.290000915527344,
                44.90999984741211,
                46.95000076293945,
                46.849998474121094,
                48.66999816894531,
                48.88999938964844,
                48.560001373291016,
                48.540000915527344,
                48.5099983215332,
                47.790000915527344,
                47.02000045776367,
                47.61000061035156,
                49.36000061035156,
                49.849998474121094,
                50.29999923706055,
                51.36199951171875,
                50.4640007019043,
                49.61399841308594,
                49.38100051879883,
                51.641998291015625,
                52.74599838256836,
                53.178001403808594,
                53.79399871826172,
                53.94200134277344,
                54.290000915527344,
                52.58599853515625,
                52.63999938964844,
                50.88199996948242,
                53.369998931884766,
                54.20000076293945,
                56.53200149536133,
                56.38800048828125,
                56.29600143432617,
                58.220001220703125,
                57.97200012207031,
                58.7239990234375,
                58.95600128173828,
                61.310001373291016,
                62.45399856567383,
                64.25199890136719,
                66.28199768066406,
                59.03799819946289,
                56.60200119018555,
                57.93600082397461,
                60.04199981689453,
                60.53799819946289,
                61.7140007019043,
                62.922000885009766,
                62.69599914550781,
                64.99800109863281,
                65.76399993896484,
                68.3239974975586,
                70.03399658203125,
                71.86399841308594,
                73.84200286865234,
                73.77999877929688,
                76.6259994506836,
                78.63400268554688,
                80.44200134277344,
                80.82599639892578,
                82.83999633789062,
                86.91000366210938,
                87.11599731445312,
                87.51399993896484,
                83.58200073242188,
                85.1500015258789,
                85.46399688720703,
                82.56199645996094,
                80.22200012207031,
                82.30000305175781,
                85.72599792480469,
                82.54399871826172,
                79.43800354003906,
                80.23600006103516,
                80.80400085449219,
                79.0,
                81.3759994506836,
                80.21800231933594,
                80.35199737548828,
                82.44400024414062,
                84.73999786376953,
                86.85600280761719,
                86.75199890136719,
                87.6259994506836,
                85.77400207519531,
                86.56600189208984,
                90.12999725341797,
                93.79199981689453,
                96.93199920654297,
                99.63400268554688,
                99.88200378417969
              ],
              "volume": [
                33883,
                323745,
                89613,
                278339,
                99878,
                163919,
                403233,
                127858,
                152428,
                167688,
                123167,
                100421,
                61165,
                52774,
                82124,
                152021,
                237653,
                307516,
                191184,
                323211,
                271773,
                272237,
                321827,
                106912,
                254448,
                262344,
                339375,
                662224,
                115472,
                315099,
                335803,
                236434,
                162309,
                109795,
                267018,
                401173,
                366807,
                203245,
                361374,
                329713,
                372250,
                645870,
                490564,
                358215,
                328940,
                419501,
                288820,
                314921,
                332774,
                566295,
                624644,
                781338,
                604518,
                536880,
                525517,
                341423,
                802678,
                422283,
                560578,
                569503,
                524466,
                841133,
                606156,
                768173,
                902224,
                1016868,
                2852387,
                1772094,
                1140664,
                1194725,
                867196,
                865281,
                1194289,
                1400730,
                1535062,
                1152055,
                1636635,
                1419473,
                2016449,
                1895105,
                1723546,
                1404659,
                1576510,
                1692157,
                1924829,
                1766701,
                2007076,
                1880605,
                2493307,
                2851676,
                2523139,
                1667223,
                2192310,
                1671696,
                1408719,
                1302043,
                1648646,
                1456062,
                1264503,
                1122923,
                1401816,
                1356955,
                1421850,
                773892,
                1004254,
                972189,
                1001317,
                888465,
                1070894,
                1256320,
                1007339,
                644220,
                1076993,
                972274,
                713396,
                28366
              ],
              "low": [
                35.290000915527344,
                32.66999816894531,
                35.79999923706055,
                34.72999954223633,
                36.86000061035156,
                39.22999954223633,
                41.959999084472656,
                42.310001373291016,
                41.779998779296875,
                41.45000076293945,
                41.4900016784668,
                36.209999084472656,
                37,
                37.959999084472656,
                41.31999969482422,
                39.59000015258789,
                36.5,
                34.66999816894531,
                38.68000030517578,
                38.689998626708984,
                38.93000030517578,
                39.0099983215332,
                40.25,
                41.5,
                41.189998626708984,
                41.84000015258789,
                41.130001068115234,
                44.04999923706055,
                45.66999816894531,
                45.7599983215332,
                46.709999084472656,
                47.470001220703125,
                46.79999923706055,
                46.900001525878906,
                46.5,
                44.880001068115234,
                45.619998931884766,
                47.720001220703125,
                47.970001220703125,
                48.56999969482422,
                49.119998931884766,
                46.551998138427734,
                46.5,
                46.46500015258789,
                48.803001403808594,
                50.72100067138672,
                50.59400177001953,
                52.279998779296875,
                52.5260009765625,
                49.4640007019043,
                49.4739990234375,
                45.89500045776367,
                46.33000183105469,
                50.79600143432617,
                52.349998474121094,
                54.529998779296875,
                53.172000885009766,
                52.757999420166016,
                56.27000045776367,
                53.987998962402344,
                56.38199996948242,
                56.40800094604492,
                58.652000427246094,
                59.380001068115234,
                61.375999450683594,
                55.652000427246094,
                43.25,
                47.58000183105469,
                53.130001068115234,
                55.231998443603516,
                57.20000076293945,
                57.922000885009766,
                58.09600067138672,
                57.95399856567383,
                58.757999420166016,
                63.46799850463867,
                64.61199951171875,
                65.9219970703125,
                67,
                71.87200164794922,
                70.63600158691406,
                73.05000305175781,
                75.3239974975586,
                77.70999908447266,
                77.94599914550781,
                77.30400085449219,
                82.8219985961914,
                81.9260025024414,
                78.38999938964844,
                76.22799682617188,
                77.10399627685547,
                80.37799835205078,
                75.27400207519531,
                72,
                73.57599639892578,
                80.25,
                75.0479965209961,
                73.43199920654297,
                76.91200256347656,
                74.43800354003906,
                75.23999786376953,
                78.23799896240234,
                75.2979965209961,
                77.80000305175781,
                77.7699966430664,
                81.1780014038086,
                82.66600036621094,
                82.4739990234375,
                83.9000015258789,
                80.55000305175781,
                81.74600219726562,
                86.79000091552734,
                88.85399627685547,
                92.5,
                96.26200103759766,
                99.45999908447266
              ]
            }
          ],
          "adjclose": [
            {
              "adjclose": [
                35.81999969482422,
                36.209999084472656,
                37.220001220703125,
                37.68000030517578,
                39.619998931884766,
                42.130001068115234,
                43.380001068115234,
                42.560001373291016,
                43.400001525878906,
                41.7599983215332,
                42.9900016784668,
                39.4900016784668,
                38.150001525878906,
                41.83000183105469,
                43.380001068115234,
                41.63999938964844,
                38.81999969482422,
                38.939998626708984,
                39.470001220703125,
                39.47999954223633,
                41.040000915527344,
                40.529998779296875,
                42.2599983215332,
                42.369998931884766,
                42.29999923706055,
                42.58000183105469,
                44.849998474121094,
                46.02000045776367,
                45.66999816894531,
                48.029998779296875,
                48.2400016784668,
                47.93000030517578,
                47.34000015258789,
                46.95000076293945,
                46.540000915527344,
                46.099998474121094,
                47.47999954223633,
                49.119998931884766,
                49.04999923706055,
                49.630001068115234,
                50.20800018310547,
                49.2760009765625,
                47.46799850463867,
                49.292999267578125,
                51.130001068115234,
                51.236000061035156,
                52.512001037597656,
                53.47999954223633,
                53.86800003051758,
                51.231998443603516,
                51.459999084472656,
                47.176998138427734,
                50.88199996948242,
                52.874000549316406,
                54.178001403808594,
                56.15399932861328,
                53.49399948120117,
                55.529998779296875,
                57.61000061035156,
                56.62200164794922,
                58.47200012207031,
                58.402000427246094,
                60.9900016784668,
                61.93000030517578,
                62.06399917602539,
                56.65999984741211,
                50.44599914550781,
                55.310001373291016,
                56.72600173950195,
                57.65999984741211,
                57.395999908447266,
                60.88399887084961,
                60.20399856567383,
                58.52399826049805,
                64.34200286865234,
                65.3219985961914,
                65.61399841308594,
                67.76599884033203,
                71.8499984741211,
                73.21600341796875,
                73.04000091552734,
                76.49600219726562,
                77.98400115966797,
                80.28800201416016,
                78.7760009765625,
                82.83999633789062,
                83.34600067138672,
                86.70600128173828,
                82.0260009765625,
                80.55400085449219,
                84.302001953125,
                82.09600067138672,
                79.23400115966797,
                74.2239990234375,
                81.73200225830078,
                80.33200073242188,
                75.66999816894531,
                79.1520004272461,
                79.37000274658203,
                74.85399627685547,
                78.52200317382812,
                79.04399871826172,
                79.10399627685547,
                79.30599975585938,
                81.34200286865234,
                84.42400360107422,
                86.40799713134766,
                85.91400146484375,
                84.5199966430664,
                81.53600311279297,
                86.39399719238281,
                89.95999908447266,
                93.01399993896484,
                96.45600128173828,
                99.59200286865234,
                99.6240005493164
              ]
            }
          ]
        }
      }
    ],
    "error": null
  }
} 
  return new Promise<YFinChartResult>((resolve) => {
    const timeoutHandel = setTimeout(() => {
      console.log("response after timeout!", response )
      console.log(response["chart"]["result"][0]);
      resolve(response["chart"]["result"][0]);
    }, 1500);
    abortController?.signal.addEventListener("abort", () => {
      console.log("clear timeout")
      clearTimeout(timeoutHandel);
    });
  });
}

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
