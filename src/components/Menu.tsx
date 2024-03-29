
//<Menu title="Chart Range"  onChange={onChangeRange} >
//  <MenuItem value="1d" title="One Day" /> 
//  <MenuItem value="5d" title="Five Days" /> 
//</Menu>

import { useState } from "react"

interface MenuProps<T> {
    title:string
    opened?:boolean
    onOpen?:() => void
    onClose?:() => void
    onChange?:(v:T) => void
    //children?:ReactElement<MenuItemProps<T>, typeof MenuItem<T>>[]
    children?:JSX.Element[]
}
export default function Menu<T>({title, opened, onOpen, onClose, onChange, children}:MenuProps<T>) {
    const [open, setOpen] = useState<boolean>(opened || false)
    return (
        <span className="dropdown">
            <span className="dropDownTitle" onClick={()=> {
                                                            const newOpen = !open
                                                            setOpen(newOpen);
                                                            if(newOpen) {
                                                                onOpen && onOpen()
                                                            } else {
                                                                onClose && onClose()
                                                            }
                                                          }}>{title}</span>
            { children && children.length > 0 &&  open &&
                <ul className="menu">
                    {
                        children.map((child, i) => {
                            return <li key={i} className="menuItem" onClick={() => {setOpen(false); onChange && onChange(child.props.value); onClose && onClose()}}>
                                {child}
                            </li>
                        })
                    }
                </ul>
            }
        </span>
    )
}
