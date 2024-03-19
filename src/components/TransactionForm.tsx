import { useState } from "react"
import MoneyInput from "./MoneyInput"

type TOrderNullable = {
    date:Date | null
    symbol:string
    amount:number | null
    price:number | null
    fees:number | null
    currency:string | null
    marketplace:string | null
    bank:string | null
    kind:string | null // TODO kind is mayb bette not to save in transctions
}

interface TransactionFormParams {
    action:"buy" | "sell"
    symbol:string
    defaultCurrency?:string
    longName?:string
    shortName?:string
    kind?:string
    marketplace?:string
    bank?:string
    onSubmit?:(transaction:TOrderNullable)=>void
    onCancel?:()=>void
}


function fromString(s:string):number|null { return !s || s === "" ? null : Number(s)}
export default function TransactionForm({
        action,
        symbol,
        defaultCurrency,
        longName,
        shortName,
        kind,
        marketplace,
        bank,
        onSubmit,
        onCancel
    }:TransactionFormParams) {
    const [transaction, setTransaction] = useState<TOrderNullable>({symbol:symbol, date:new Date(), amount:null, price:null, fees:null, bank:bank, marketplace:marketplace, kind:kind, currency:defaultCurrency} as TOrderNullable)
    return (
        <>
        <div>{action} {symbol} {longName} {shortName} {kind}</div>
        <form onReset={(e)=>{ e.preventDefault()
                              onCancel && onCancel() }
                      }
              onSubmit={(e)=>{
                    e.preventDefault()
                    onSubmit && onSubmit(transaction)
                }} >
            <div>
                <label htmlFor="date">Date*&nbsp;</label>
                <input id="date" name="date" type="date" datatype="date" lang={navigator.language} 
                        value={transaction.date?.toISOString().substring(0,10) }
                        onChange={(e)=>{if(e.target.valueAsDate) setTransaction({...transaction,date:e.target.valueAsDate})}}/>
            </div>
            <div> {/* crypto input needs arbitrary fractions... */}
                <MoneyInput id="amount" required={true} title="Amount" decimalPlaces={20} 
                            amount={transaction.amount}
                            onChange={(e)=>setTransaction({...transaction,amount:fromString(e.target.value)})}/>
            </div>
            <div>
                <MoneyInput id="price" required={true} title="Price per share" decimalPlaces={2} 
                            amount={transaction.price}
                            onChange={(e)=>setTransaction({...transaction,price:fromString(e.target.value)})}/>
            </div>
            <div>
                <MoneyInput id="feess" required={false} title="Fees" decimalPlaces={2} 
                            amount={transaction.fees}
                            onChange={(e)=>setTransaction({...transaction,fees:fromString(e.target.value)})}/>
            </div>
            <div>
                {defaultCurrency !== null && defaultCurrency !==undefined && defaultCurrency.length>0 ?
                <>
                <label htmlFor="currency">Currency*&nbsp;</label>
                <label id="currency" >{transaction.currency}</label>
                </>
                        :
                        <>
                <label htmlFor="currency">Currency*&nbsp;</label>
                <input id="currency" name="currency" type="text" 
                        required 
                        readOnly={defaultCurrency !== null && defaultCurrency !== undefined && defaultCurrency.length>0}
                        value={transaction.currency || ""}
                        onChange={(e)=>setTransaction({...transaction,currency:e.target.value})}/>
                        </>
                }

            </div>
            <div>
                <label htmlFor="marketplace">Marketplace&nbsp;</label>
                <input id="marketplace" name="marketplace" type="text"
                        value={transaction.marketplace || ""}
                        onChange={(e)=>setTransaction({...transaction,marketplace:e.target.value})}/>
            </div>
            <div>
                <label htmlFor="bank">bank&nbsp;</label>
                <input id="bank" name="bank" type="text"
                        value={transaction.bank || ""}
                        onChange={(e)=>setTransaction({...transaction,bank:e.target.value})}/>
            </div>
            <div>
                <button type="submit">Add Transaction</button>
                <button type="reset">Cancel</button>
            </div>
        </form>
        </>
    )
}