import React, { useCallback, useMemo, useRef } from 'react'
import { useState } from 'react'
import './App.css'
import StockDetail from './StockDetail'
import StockList from './StockList'
import StockSearch from './StockSearch'
import StockItemRepresentation from './StockItemRepresentation'
import MainLayout, { MainLayoutRef } from './MainLayout'
import { useWealth } from '../provider/WealthProvider'
import { YFinQuoteResult } from '../hooks/useYFinApi'
import Chart from './Chart'

export default function WealthApp({show,showBuy,additionalHeaderElements}:
                                  {show:boolean} &
                                  {showBuy?:(selected:YFinQuoteResult)=>void} &
                                  {additionalHeaderElements?:JSX.Element[]}) {
  const wealthCtx = useWealth()
  const mainLayoutRef = useRef<MainLayoutRef|null>(null)
  const [selected, setSelected] = useState<YFinQuoteResult | null>(null)

  const detailRepresentation = useCallback((s:YFinQuoteResult) =>  {
    if(mainLayoutRef.current) {
      console.log("layoput ref ready")
      return (
        <>
          {s && s.shortName}
          <Chart symbol={s.symbol} height={mainLayoutRef.current?.detailPane().height} width={mainLayoutRef.current?.detailPane().width} />
        </>
      )
    } else {
      console.log("layoput ref not ready")
      return (
        <>
          {s && s.shortName}
        </>
      )
    }
  },[mainLayoutRef])
              

  return (
    <MainLayout show={show} ref={mainLayoutRef}>
        <>
          <StockSearch onSearch={q=> { wealthCtx.search(q) }}/>
          { additionalHeaderElements }
        </>

        <StockList<YFinQuoteResult> 
          list={Object.values(wealthCtx.filteredMasterdata)}
          stockRepresentation={(s) => <StockItemRepresentation  kind={wealthCtx.aggregations[s.symbol].kind || "kind unknown"} 
                                                                symbol={s.symbol}
                                                                name={s.shortName || s.longName || "no nmae"}
                                                                count={wealthCtx.aggregations[s.symbol].holding.count}
                                                                price={wealthCtx.aggregations[s.symbol].holding.avgPrice}
                                      /> 
                              }
          onSelect={(s)=>{setSelected(s)}}
        />
        {
          selected ? 
            showBuy ? 
              <StockDetail value={selected}
                          representation={detailRepresentation}
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          onAddToWealth={(s)=>showBuy(s)}/>
                          :
              <StockDetail value={selected }
                          representation={detailRepresentation}
              />
          :
            <h1>nothing selected</h1>
        }
    </MainLayout>
  )
}
