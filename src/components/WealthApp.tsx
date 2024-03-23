import { useState } from 'react'
import './App.css'
import StockDetail from './StockDetail'
import StockList from './StockList'
import StockSearch from './StockSearch'
import StockItemRepresentation from './StockItemRepresentation'
import MainLayout from './MainLayout'
import { useWealth } from '../provider/WealthProvider'
import { YFinQuoteResult } from '../hooks/useYFinApi'
import React from 'react'

export default function WealthApp({show,showBuy,additionalHeaderElements}:
                                  {show:boolean} &
                                  {showBuy?:(selected:YFinQuoteResult)=>void} &
                                  {additionalHeaderElements?:JSX.Element[]}) {
  const wealthCtx = useWealth()
  const [selected, setSelected] = useState<YFinQuoteResult | null>(null)

  return (
    <MainLayout show={show}>
        <>
          <StockSearch onSearch={q=> { wealthCtx.search(q) }}/>
          { additionalHeaderElements }
        </>

        <StockList<YFinQuoteResult> 
          list={Object.values(wealthCtx.filteredMasterdata)}
          stockRepresentation={(s) => <StockItemRepresentation kind={wealthCtx.aggregations[s.symbol].kind || "kind unknown"} 
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
                          representation={(s)=><>{s && s.shortName}</>}
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          onAddToWealth={(s)=>showBuy(s)}/>
                          :
              <StockDetail value={{...selected }}
                          representation={(s)=><>{s && s.shortName}</>}
              />
          :
            <h1>nothing selected</h1>
        }
    </MainLayout>
  )
}
