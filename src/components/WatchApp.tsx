import { useState } from 'react'
import './App.css'
import StockDetail from './StockDetail'
import StockList from './StockList'
import StockSearch from './StockSearch'
import StockItemRepresentation from './StockItemRepresentation'
import MainLayout from './MainLayout'
import { TWatch } from '../models/watch'
import { useWatchlist } from '../provider/WatchListProvider'

export default function WatchApp({show,showBuy, additionalHeaderElements}:
                                 {show:boolean} &
                                 {showBuy?:(selected:TWatch) => void} &
                                 {additionalHeaderElements?:JSX.Element[]}) {
  const watchlistCtx = useWatchlist()
  const [selected, setSelected] = useState<TWatch | null>(null)

  const onDelete = (s:TWatch) => {
    console.log("on Delete", s)
    watchlistCtx.del(s)
  }

  return (
    <MainLayout show={show}>
        <>
          <StockSearch onSearch={q=> { watchlistCtx.search(q) }}/>
          {additionalHeaderElements}
        </>

        <StockList<TWatch> 
          list={watchlistCtx.watchlist}
          stockRepresentation={(s) => <StockItemRepresentation kind={s.typeDisp} symbol={s.symbol} name={s.name} fav={true} /> /* in watchlists is same as fav thus fav=true here */ }
          onSelect={(s)=>{setSelected(s)}}
          onDelete={onDelete}
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
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                         /> 
          :
            <h1>nothing selected</h1>
        }

    </MainLayout>
  )
}
