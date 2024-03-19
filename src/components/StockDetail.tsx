import { ReactNode } from "react"

type StockDetailsProps<T> = {
    value?:T
    representation?:(v:T) => ReactNode
    onAddToWatch?:(v:T) => void
    onAddToWealth?:(v:T) => void
}
export default function StockDetail<T>({value, representation, onAddToWatch, onAddToWealth}:StockDetailsProps<T>) {
    return (
        <>
            <div>
                {value && representation && representation(value)}
            </div>
            {value &&
            <div>
                {onAddToWatch && <button onClick={()=> value && onAddToWatch && onAddToWatch(value)}>Add to Watchlist</button> }
                {onAddToWealth && <button onClick={()=> value && onAddToWealth && onAddToWealth(value)}>Add to Wealth</button>}
            </div>
            }
        </>
    )
}

