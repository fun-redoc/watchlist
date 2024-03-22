import React from "react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import useYFinApi, {
  YFinAutocompleteResult,
  YFinChartResult,
  YFinQuoteResult,
} from "../hooks/useYFinApi";

function useYFinProvider(): {
  queryResult: YFinAutocompleteResult[] | "loading";
  query: string | null;
  search: (query: string) => void;
  getDetails: (symbol: string) => Promise<YFinQuoteResult | undefined>;
  chart: (symbol:string) => Promise<YFinChartResult>;
} {
  const { autocomplete, getAsset, getChart } = useYFinApi();
  // Statemanagement Types
  async function searchYFin(
    q?: string | null,
  ): Promise<YFinAutocompleteResult[]> {
    if (!q) return [];
    return await autocomplete(q);
  }
  type TState = {
    queryResult: YFinAutocompleteResult[] | "loading";
    query: string | null;
  };
  type TAction =
    | { action: "setQueryReslut"; param: TState["queryResult"] }
    | { action: "setQuery"; param: TState["query"] };

  // Statemanagement state transition
  const [{ queryResult, query }, dispatch] = useReducer(
    (state: TState, action: TAction) => {
      switch (action.action) {
        case "setQueryReslut":
          return { ...state, queryResult: action.param };
        case "setQuery":
          return { ...state, query: action.param };
      }
    },
    {
      queryResult: [],
      query: null,
    },
  );

  // fetching data
  // TODO add abort controller
  useEffect(() => {
    dispatch({ action: "setQueryReslut", param: "loading" });
    searchYFin(query).then((list) =>
      dispatch({ action: "setQueryReslut", param: list }),
    );
  }, [query]);

  // exported access functions
  const search = useCallback((query: string) => {
    dispatch({ action: "setQuery", param: query });
  }, []);

  // TODO add abort controller
  const getDetails = useCallback(async (symbol: string) => {
    return getAsset(symbol);
  }, [getAsset]);

  const chart = useCallback(async (symbol:string) => {
    return getChart(symbol)
  },[getChart])

  // returning the provider
  return { queryResult, query, search, getDetails, chart };
}

const YFinContext = createContext<ReturnType<typeof useYFinProvider>>(
  {} as ReturnType<typeof useYFinProvider>,
);

// eslint-disable-next-line react-refresh/only-export-components
export const useYFin = () => useContext(YFinContext);

export function YFinProvider({ children }: { children: React.ReactNode }) {
  return (
    <YFinContext.Provider value={useYFinProvider()}>
      {children}
    </YFinContext.Provider>
  );
}
