import { YFinQuoteResult, YFinAutocompleteResult } from "../hooks/useYFinApi";

type YFinElem = YFinAutocompleteResult & {
  i: number;
  fav: boolean;
} & YFinQuoteResult;
export default function StockDetailRepresentation({
  props,
}: {
  props: YFinElem;
}) {
  console.log(props);
  return (
    <>
      <div>{props && props.shortName}</div>
      <div>{props && props.symbol}</div>
      <div>{props && props.typeDisp}</div>
    </>
  );
}
