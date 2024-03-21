import React from "react"
import { ChangeEventHandler, useRef } from "react"

export default function MoneyInput({amount, required, id, title, decimalPlaces,onChange}:{amount:number|null, required:boolean, id:string, title:string, decimalPlaces:number, onChange:ChangeEventHandler<HTMLInputElement>}) {
    const oldFormat = useRef<{backgroundColor:string, color:string}>({backgroundColor:'inherit', color:'inherit'})
    const regexpDef = "^\\d*(?:\\.\\d{1," + Math.floor(decimalPlaces) + "})?$"
    const regexpDefRequired = "^\\d+(?:\\.\\d{1," + Math.floor(decimalPlaces) + "})?$"
    const regexp = new RegExp( required ? regexpDefRequired : regexpDef)
    const placeHoler = decimalPlaces >0 ? "0." + "0".repeat(decimalPlaces) : "0"
    const step =  decimalPlaces >0 ? "0." + "0".repeat(decimalPlaces-1) + "1" : "1"
    return (
        <>
            <label htmlFor={id}>{title}{required && '*'}&nbsp;</label>
                <input type="number" placeholder={placeHoler} required={required} id={id} name={id} min="0" step={step} title={title} pattern={regexp.source} 
                value={amount !== null ? amount : ""}
                onBlur={(e)=>{
                    oldFormat.current = {backgroundColor:e.target.style.backgroundColor, color:e.target.style.color}
                    const hasValidFormat = regexp.test(e.target.value)
                    e.target.style.backgroundColor=hasValidFormat?'inherit':'red'
                    e.target.style.color=hasValidFormat?'inherit':'white'
                }}
                onFocus={(e) => {
                    e.target.style.backgroundColor=oldFormat.current.backgroundColor
                    e.target.style.color=oldFormat.current.color
                }}
                onChange={(e) => {
                    onChange(e)
                    const hasValidFormat = regexp.test(e.target.value)
                    if(!hasValidFormat) {
                        e.target.setCustomValidity(`${title} has not the required format, please provide an correct entry.`)
                    } else {
                        e.target.setCustomValidity("")
                    }
                }
                }/>
        </>
    )
}