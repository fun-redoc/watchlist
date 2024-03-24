//import { useId } from "react"

import React, { Ref, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react"

interface Dimensions {width:number|undefined, height:number|undefined}


export interface MainLayoutRef {
    detailPane: () => Dimensions
}

interface MainLayoutProps {
    show:boolean
    children:JSX.Element[]
}
//export default function MainLayout({show, children}:MainLayoutProps) {
export default forwardRef( function MainLayout(props:MainLayoutProps, ref:Ref<MainLayoutRef>) {
//    const id = useId()
    const [head,sidebar, ...content] = props.children
    const detailRef = useRef<HTMLDivElement|null>(null)

    const getDimensionsOfDetailPane = useCallback(()=> {
        console.log("callback getDimensionOfDetailPane")
        return {width:detailRef.current?.clientWidth, height:detailRef.current?.clientHeight}
    },[detailRef])
 
    useImperativeHandle(ref, () =>{
        return {
            detailPane: getDimensionsOfDetailPane
        }
    } ,[getDimensionsOfDetailPane])

//    const element = document.getElementById(id)
//    if(element) {
//        element.hidden = !show
//    }
    // hiding preserves the rendered component when returning
    return (
        <div hidden={!props.show}> {/* for some reason does not work with the div below, i suspect it collides with the css display attribute */}
            <div className="app">
                <div id="head">
                    {head}
                </div>
                <div id="list" >
                    {sidebar}
                </div>
                <div ref={detailRef} id="detail">
                    {content}
                </div>
            </div>
        </div>
    )
}
)
