import React from "react"

interface StockItemRepresentationProps {
    kind:string
    symbol:string
    name:string
    fav:boolean
}
export default function StockItemRepresentation({kind, symbol, name, fav}:StockItemRepresentationProps) {
    return (
        <>
            <span className="stockItemRepresentationShort">
                <span id="kind">{kind}</span>
                <span id="symbol">{symbol}</span>
                <span id="fav">{fav && "★"}</span>
                <div id="name">{name}</div>
            </span>
        </>
    )
}