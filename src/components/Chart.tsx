import { useEffect, useMemo, useRef, useState } from "react"
import * as d3 from 'd3'
import useYFinApi, { ChartParams, YFinChartResult } from "../hooks/useYFinApi";
import useCache from "../hooks/useCache";

interface ChartData {
    date:Date
    value:d3.NumberValue | undefined
}

function parseData(data:YFinChartResult):ChartData[] {
    return data.timestamp.map((timestamp, i) => {
        return {date:new Date(timestamp*1000), value:data.indicators.quote[0].close[i]} // prerequisite cart was fetched without "comparisons" parameter, beware!
    })
}

interface ChartProps {
    symbol:string
    range:ChartParams["range"]
    interval:ChartParams["interval"]
    event:ChartParams["event"]
    height?:number|undefined
    width?:number|undefined
}

// TODO show  error state
// TODO handle stock splits appropriatelly
// TODO chart exceeds the vieport...fix it
export default function Chart({symbol, range, interval, event, height, width}:ChartProps) {
    const yfinCtx = useYFinApi(false)
    const getChartWithCache = useCache<YFinChartResult, typeof yfinCtx.getChart>(yfinCtx.getChart);
    const svgRev = useRef<SVGSVGElement>(null)
    const [yfinData, setYFinData] = useState<YFinChartResult|null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    

    useEffect(() => {
       console.log("effect fetch yfin for symbol", symbol)
       setIsLoading(true)
       const abortController = new AbortController()
       getChartWithCache([symbol, {range, interval, event}, abortController])
                    .then(result => {
                        console.log("fetched data", result)
                        setYFinData(result)
                        setIsLoading(false)
                    },
                    reason => {
                        console.error("Faild to fetch chart from api", reason)
                    })
                    .catch(reason => {
                        console.error("Faild to fetch chart from api", reason)
                    })
       return () => abortController.abort("aborted by effect.")
    },[symbol, yfinCtx])

    const chartData = useMemo(() =>  yfinData  && parseData(yfinData), [yfinData]) 

    useEffect(() => {
        if(svgRev && chartData && chartData?.length > 0) {
            const svgWidth = width || 200, svgHeight = height || 100
            const margin = { top: 20, right: 20, bottom: 30, left: 50 }
            const width1 = svgWidth - margin.left - margin.right
            const height1 = svgHeight - margin.top - margin.bottom

            const svg = d3.select(svgRev.current)
                            .attr("width", svgWidth)
                            .attr("height", svgHeight)
            const g = svg.append("g")
                            .attr("transform",`translate(${margin.left}, ${margin.top})`);
            
            // TODO may taking range data is better from the "metadata" branch of the api response
            const x = d3.scaleTime().rangeRound([0, width1]);
            const y = d3.scaleLinear().rangeRound([height1, 0]);
            const line = d3.line<ChartData>()
                            .x((d) => x(d.date))
                            .y((d) => y(d.value||0))

            //x.domain(d3.extent(chartData, (d) =>  d.date )); // typescript makes this line more complex but typesave :-))
            const [min_date, max_date] = d3.extent(chartData, (d) =>  d.date );
            if(!min_date || ! max_date) {
                console.error("d3 extent could not be determined.")
            } else {
                x.domain([min_date || new Date(), max_date || new Date()]);
            }

            //y.domain(d3.extent(chartData, (d) =>  d.value ));
            const [min_value, max_value] = d3.extent(chartData, (d) =>  d.value );
            if(!min_value || ! max_value) {
                console.error("d3 extent could not be determined.")
            } else {
                y.domain([min_value , max_value]);
            }

            g.append("g")
                .attr("transform", `translate(0,${height1})`)
                .call(d3.axisBottom(x))
                .select(".domain")
                .remove();
            g.append("g")
                .call(d3.axisLeft(y))
                .append("text")
                .attr("fill", "#000")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Price (<TODO currency>)");

            g.append("path")
                .datum(chartData)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1.5)
                .attr("d", line);
        }

    }, [svgRev, chartData])

    console.log(`width=${width}, height=${height}`)
    return (
        <> { isLoading ?
                <div className="loading">loading chart data...</div>
            :
                <svg ref={svgRev} className="d3Container" />
            }
        </>
    )
}