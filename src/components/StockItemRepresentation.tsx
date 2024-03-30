import './StockItemRepresentation.css'

interface StockItemRepresentationProps {
    kind:string
    symbol:string
    name:string
    fav?:boolean
    count?:number
    price?:number
}
export default function StockItemRepresentation({kind, symbol, name, fav, count, price}:StockItemRepresentationProps) {
    return (
        <>
            <span className="stockItemRepresentationShort">
                {fav && <span id="fav">{fav ? "★" : <>&nbsp;</>}</span>}
                <span id="kind">{kind}</span>
                <span id="symbol">{symbol}</span>
                {count && <span id="count">{count}</span> }
                {price && <span id="price">{price}</span> }
                <div id="name">{name}</div>
            </span>
        </>
    )
}