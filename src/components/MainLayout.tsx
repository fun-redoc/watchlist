//import { useId } from "react"


interface MainLayoutProps {
    show:boolean
    children:JSX.Element[]
}
export default function MainLayout({show, children}:MainLayoutProps) {
//    const id = useId()
    const [head,sidebar, ...content] = children

//    const element = document.getElementById(id)
//    if(element) {
//        element.hidden = !show
//    }
    // hiding preserves the rendered component when returning
    return (
        <div hidden={!show}> {/* for some reason does not work with the div below, i suspect it collides with the css display attribute */}
            <div className="app">
                <div id="head">
                    {head}
                </div>
                <div id="list" >
                    {sidebar}
                </div>
                <div id="detail">
                    {content}
                </div>
            </div>
        </div>
    )
}

