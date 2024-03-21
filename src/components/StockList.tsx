import React from "react"
import { ReactNode, useState } from "react"

interface StockListCallbacks<T> {
    onSelect?:(stock:T, i:number)=>void
    onDelete?:(stock:T)=>void
    stockRepresentation:(stock:T)=>ReactNode
}
type StockListProps<T> = {list?: T[]} & StockListCallbacks<T>
export default function StockList<T>({list, onSelect, onDelete, stockRepresentation}:StockListProps<T>) {
    const [selectedKey, setSelectedKey] = useState<React.Key|null>(null)
    return (
        <>
            {
                list && list.length > 0 ?
                    <ul>
                        {list.map((s,i) => 
                            <li key={i}>
                                <StockListItem value={s} i={i} selected={selectedKey !== null && (selectedKey === i)}
                                                onSelect={(v)=>{
                                                    setSelectedKey(i)
                                                    onSelect && onSelect(v,i)
                                                }}
                                                onDelete={onDelete}
                                                stockRepresentation={stockRepresentation}/>
                            </li>)} 
                    </ul>
                :
                <div>nothing to show</div>
            }
        </>
    )
}

type StockListItemProps<T> = {value: T, i:number, selected:boolean} & StockListCallbacks<T>
function StockListItem<T>({value, i,  selected, onSelect, onDelete, stockRepresentation}:StockListItemProps<T>) {
    return (
        <>
        <div className="ListItem" style={selected ? {background:"red"} : {background:"none"}}>
            <span onClick={()=>{
                        onSelect && onSelect(value,i)
                    }}
            >{stockRepresentation(value)}</span>
        </div>
        <div className="ListItemDeleteButton"
             hidden={!onDelete}
             onClick={()=> onDelete &&onDelete(value)}
        >❌</div>
        </>
    )
}

            //{onDelete && <span onClick={()=>onDelete(value)}>Del</span>}