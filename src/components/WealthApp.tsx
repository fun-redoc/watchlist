import { useCallback, useRef } from 'react'
import { useState } from 'react'
import './App.css'
import StockDetail from './StockDetail'
import StockList from './StockList'
import StockSearch from './StockSearch'
import StockItemRepresentation from './StockItemRepresentation'
import MainLayout, { MainLayoutRef } from './MainLayout'
import { useWealth } from '../provider/WealthProvider'
import { ChartParams, YFinQuoteResult, _interval, _range } from '../hooks/useYFinApi'
import Chart from './Chart'
import Menu from './Menu'
import MenuItem from './MenuItem'

export default function WealthApp({show,showBuy,additionalHeaderElements}:
                                  {show:boolean} &
                                  {showBuy?:(selected:YFinQuoteResult)=>void} &
                                  {additionalHeaderElements?:JSX.Element[]}) {
  const wealthCtx = useWealth()
  const mainLayoutRef = useRef<MainLayoutRef|null>(null)
  const [selected, setSelected] = useState<YFinQuoteResult | null>(null)
  const [menuOpened, setMenuOpened] = useState<number>(0x000)
  const [menuVals, setChartParams] = useState<ChartParams>({range:"1d", interval:"1d", event:null})

  const detailRepresentation = useCallback((s:YFinQuoteResult) =>  {
    if(mainLayoutRef.current) {
      console.log("layoput ref ready")
      return (
        <>
          {s && s.shortName}
          <Chart symbol={s.symbol} range={menuVals.range} interval={menuVals.interval} event={menuVals.event}
                 height={mainLayoutRef.current?.detailPane().height} width={mainLayoutRef.current?.detailPane().width} />
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
              
  const onChangeRange = useCallback((v:string) => {console.log(`range ${v} selected`)}, [])
  const onMenuFlip = useCallback((flags:number) => setMenuOpened(flags),[])

  const menuId = Date.now() // key value which causes rerender
  return (
    <MainLayout show={show} ref={mainLayoutRef}>
        <>
          <StockSearch onSearch={q=> { wealthCtx.search(q) }}/>
          { additionalHeaderElements }
          <Menu key={menuId} opened={(menuOpened & 0x100) !== 0}
                title="Chart Range"  
                onOpen={()=>onMenuFlip(0x100)}
                onChange={onChangeRange} >
                {_range.map((r:ChartParams["range"]) => <MenuItem<ChartParams["range"]> value={r} title={r as string}/>)}
          </Menu>
          <Menu key={menuId+1} opened={(menuOpened & 0x010) !== 0} 
                title="Chart Interval"
                onOpen={()=>onMenuFlip(0x010)}
                onChange={onChangeRange} >
                {_interval.map((r:ChartParams["interval"]) => <MenuItem<ChartParams["interval"]> value={r} title={r as string}/>)}
          </Menu>
          <Menu key={menuId+2} opened={(menuOpened & 0x001) !== 0} 
                title="Chart Events"
                onOpen={()=>onMenuFlip(0x001)}
                onChange={onChangeRange} >
            <MenuItem<ChartParams["event"]> value="div" title="Dividends" />
            <MenuItem<ChartParams["event"]> value="split" title="Splits" />
            <MenuItem<ChartParams["event"]> value={null} title="None" />
          </Menu>
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
