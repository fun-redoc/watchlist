import './Menu.css'
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
            <button className="dropdownTitle" onClick={()=> {
                                                            const newOpen = !open
                                                            setOpen(newOpen);
                                                            if(newOpen) {
                                                                onOpen && onOpen()
                                                            } else {
                                                                onClose && onClose()
                                                            }
                                                          }}>{title}</button>
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
