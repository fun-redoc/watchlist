import { useEffect, useReducer, useRef } from 'react'
import './App.css'
import { useSettings } from '../provider/SettingsProvider'

type TState = {
  apiKey:string|null
}
type TAction = {action:"setApiKey", params:string|null }

export default function Settings({show,additionalHeaderElements}:
                                 {show:boolean} &
                                 {additionalHeaderElements?:JSX.Element[]}) {
  const settingsCtx = useSettings()
  const [{apiKey}, dispatch] = useReducer((state:TState, {action, params}:TAction) => {
    switch(action) {
      case "setApiKey": return {...state, apiKey:params}
    }
  },{
    apiKey:settingsCtx?.apiKey || null
  })

  useEffect(() => { // is there a better solution, i need to recognize if the api key in settings context is finally available
    if(settingsCtx?.apiKey) {
      dispatch({action:"setApiKey", params:settingsCtx?.apiKey})
    }
  },[settingsCtx?.apiKey])

    const refApp = useRef<HTMLDivElement|null>(null)
    useEffect(() => {
        if(refApp.current) {
          // hide sidebar complettelly
            refApp.current?.style.setProperty("grid-template-columns", "0% 100%")
        }
    },[refApp])

  return (
        <div hidden={!show}> {/* for some reason does not work with the div below, i suspect it collides with the css display attribute */}
            <div ref={refApp} className="app">
                <div id="head">
                  <span className="title">Settings</span>
                  <span className="buttons">{additionalHeaderElements}</span>
                </div>
                <div id="sidebar"></div>
                <div id="detail">
                  <form 
                        onReset={() => {alert("TODO on Reset")}}
                        onAbort={() => {alert("TODO on Abort")}}
                  >
                    <label htmlFor='api-key'>
                      api key
                      <input id="api-key" name="api-key" type='text' required
                            value={apiKey || ""}
                            onChange={(e)=>dispatch({action:"setApiKey", params:e.target.value})}/>
                    </label>
                    <div className='buttons'>
                      <button type="button"
                        onClick={(e) => {
                                    e.preventDefault()
                                    settingsCtx && apiKey && settingsCtx.saveApiKey(apiKey)
                                  }}
                      >Save</button>
                      <button type="reset">Cancel</button>
                      <button type="button">Reset</button>
                    </div>
                  </form>
                </div>
            </div>
        </div>
  )
}
