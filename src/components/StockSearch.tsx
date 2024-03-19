import { useEffect, useState } from "react"
import { useDebounce } from "../hooks/useDebounce"
/**
 * wrapper over input element with debounced onSearch event handler
 */
interface StockSearchEvent {
    onSearch?:(s:string) => void
}
type StockSearchProps = StockSearchEvent & JSX.IntrinsicElements['input']
export default function StockSearch({onSearch, ...props}:StockSearchProps) {
    const [searchText, setSearchText] = useState<string>("")
    const debouncedSearchText = useDebounce<string>(searchText)
    useEffect(()=>{
        onSearch && onSearch(debouncedSearchText)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[debouncedSearchText])
    return (
        <>
        <input {...props} value={searchText} 
                        onChange={e=>{
                                const newSearchText = e.target.value
                                setSearchText(newSearchText)
                            }
                        }
        />
        </>
    )
}