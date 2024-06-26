import { useCallback, useEffect, useRef } from 'react'
import { useState } from 'react'
import './App.css'
import StockDetail from './StockDetail'
import StockList from './StockList'
import StockSearch from './StockSearch'
import StockItemRepresentation from './StockItemRepresentation'
import MainLayout, { MainLayoutRef } from './MainLayout'
import { useWealth } from '../provider/WealthProvider'
import { ChartParams, YFinChartResult, YFinQuoteResult, _interval, _range } from '../hooks/useYFinApi'
import Chart, { ChartData } from './Chart'
import Menu from './Menu'
import MenuItem from './MenuItem'
import { useYFin } from '../provider/YFinProvider'
import useCache from '../hooks/useCache'

function parseData(data:YFinChartResult):ChartData[] {
    return data.timestamp.map((timestamp, i) => {
        return {date:new Date(timestamp*1000), value:data.indicators.quote[0].close[i]} // prerequisite cart was fetched without "comparisons" parameter, beware!
    })
}

export default function WealthApp({show,showBuy,additionalHeaderElements}:
                                  {show:boolean} &
                                  {showBuy?:(selected:YFinQuoteResult)=>void} &
                                  {additionalHeaderElements?:JSX.Element[]}) {
  const yfinCtx = useYFin()
  const wealthCtx = useWealth()
  const mainLayoutRef = useRef<MainLayoutRef|null>(null)
  const [selected, setSelected] = useState<YFinQuoteResult | null>(null)
  const [menuOpened, setMenuOpened] = useState<number>(0x000)
  const [chartParams, setChartParams] = useState<ChartParams>({range:"1y", interval:"1mo", event:"split"})

  const getChartWithCache = useCache<YFinChartResult, typeof yfinCtx.chart>(yfinCtx.chart, {timeOutMillis:15*60*1000});
  const [yfinChartData, setYFinChartData] = useState<YFinChartResult|null>(null)
  const [isLoadingChart, setIsLoadingChart] = useState<boolean>(false)
    
  useEffect(() => {
    const abortController = new AbortController()
    if(selected) {
      const symbol = selected.symbol
      console.log("effect fetch yfin for symbol", symbol)
      setIsLoadingChart(true)
      getChartWithCache([symbol, chartParams, abortController])
                    .then(result => {
                        console.log("fetched data", result)
                        setYFinChartData(result)
                        setIsLoadingChart(false)
                    },
                    reason => {
                        console.error("Faild to fetch chart from api", reason)
                    })
                    .catch(reason => {
                        console.error("Faild to fetch chart from api", reason)
                    })
    }
     return () => abortController.abort("aborted by effect.")
  },[chartParams, selected])


  const detailRepresentation = useCallback((s:YFinQuoteResult) =>  {
    if(mainLayoutRef.current) {
      console.log("layout ref ready")
      if(yfinChartData) {
        return (
        <>
            {s && s.shortName}
            { isLoadingChart ?
              <div className='loading'>loading chart ...</div>
            :
              <Chart title={`Symbol:${s.symbol} Range:${chartParams.range} Interval:${chartParams.interval} Events:${chartParams.event}`}
                    data={parseData(yfinChartData) || []}
                    height={mainLayoutRef.current?.detailPane().height} width={mainLayoutRef.current?.detailPane().width} />
            }
        </>
        )
      } else {
        return <></>
      }
    } else {
      console.log("layout ref not ready")
      return (
        <>
          {s && s.shortName}
        </>
      )
    }
  },[yfinChartData])
              
  const onMenuFlip = useCallback((flags:number) => setMenuOpened(flags),[])

  const menuId = Date.now() // key value which causes rerender
  return (
    <MainLayout show={show} ref={mainLayoutRef}>
        <>
          <div className='mainMenu'>{ additionalHeaderElements }</div>
          <h1>Wealth</h1>
          <StockSearch onSearch={q=> { wealthCtx.search(q) }}/>
          <div className='appMenu'>
            <Menu<ChartParams["range"]> key={menuId} opened={(menuOpened & 0x100) !== 0}
                  title={`Chart Range (${chartParams.range})`}
                  onOpen={()=>onMenuFlip(0x100)}
                  onClose={()=>setMenuOpened(f=> f&0x011)}
                  onChange={v=>setChartParams({...chartParams, range:v})} >
                  {_range.map((r:ChartParams["range"], i) => <MenuItem<ChartParams["range"]> key={i} value={r} title={r as string}/>)}
            </Menu>
            <Menu<ChartParams["interval"]> key={menuId+1} opened={(menuOpened & 0x010) !== 0} 
                  title={`Chart Interval (${chartParams.interval})`}
                  onOpen={()=>onMenuFlip(0x010)}
                  onClose={()=>setMenuOpened(f=> f&0x101)}
                  onChange={v=>setChartParams({...chartParams, interval:v})} >
                  {_interval.map((r:ChartParams["interval"], i) => <MenuItem<ChartParams["interval"]> key={i} value={r} title={r as string}/>)}
            </Menu>
            <Menu<ChartParams["event"]> key={menuId+2} opened={(menuOpened & 0x001) !== 0} 
                  title={`Chart Events (${chartParams.event ?  chartParams.event : "-"})`}
                  onOpen={()=>onMenuFlip(0x001)}
                  onClose={()=>setMenuOpened(f=> f&0x110)}
                  onChange={v=>setChartParams({...chartParams, event:v})} >
              <MenuItem<ChartParams["event"]> value="div" title="Dividends" />
              <MenuItem<ChartParams["event"]> value="split" title="Splits" />
              <MenuItem<ChartParams["event"]> value="div,split" title="Splits & Dividends" />
              <MenuItem<ChartParams["event"]> value={null} title="None" />
            </Menu>
          </div>
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
