
//<Menu title="Chart Range"  onChange={onChangeRange} >
//  <MenuItem value="1d" title="One Day" /> 
//  <MenuItem value="5d" title="Five Days" /> 
//</Menu>


export interface MenuItemProps<T> {
    value:T
    title:string
}
export default function MenuItem<T>(props:MenuItemProps<T>) {
    return (
        <span className="menuItemInner">{props.title}</span>
    )
}
