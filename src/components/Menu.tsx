
//<Menu title="Chart Range"  onChange={onChangeRange} >
//  <MenuItem value="1d" title="One Day" /> 
//  <MenuItem value="5d" title="Five Days" /> 
//</Menu>

import { useState } from "react"
import { MenuItemProps } from "./MenuItem"

interface MenuProps<T> {
    title:string
    onChange?:(v:T) => void
    children?:JSX.Element[]
}
export default function Menu<T>({title, onChange, children}:MenuProps<T>) {
    const [open, setOpen] = useState<boolean>(false)
    return (
        <span className="dropdown">
            <span className="dropDownTitle" onClick={()=> setOpen((o)=>!o)}>{title}</span>
            { children && children.length > 0 &&  open &&
                <ul className="menu">
                    {
                        children.map((child, i) => {
                            return <li key={i} className="menuItem" onClick={() => {setOpen(false); onChange && onChange((child.props as MenuItemProps<T>).value)}}>
                                {child}
                            </li>
                        })
                    }
                </ul>
            }
        </span>
    )
}
