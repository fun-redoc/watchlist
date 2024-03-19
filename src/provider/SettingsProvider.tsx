import { createContext, useContext, useEffect, useReducer } from "react";
import { DBManager, TProvideNumericID, mkDBManager } from "../dbmanagement/DBManager";

export const DB_NAME_SETTINGS = "watchlistSettingsAppDB"
export const DB_VERSION_SETTINGS = 1    

export interface WatchlistAppSettings {
    apiKey:string|null
}

type SettingsContextRecord =
    WatchlistAppSettings &
    {
        saveApiKey:(apiKey:string) => void
    }
const SettingsContext = createContext<SettingsContextRecord|null>(null)
export default function SettingsProvider({children}:{children:JSX.Element | JSX.Element[]}) {
    return <SettingsContext.Provider value={useSettingContextProvider()}>
        {children}
    </SettingsContext.Provider>
}
// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
    return useContext(SettingsContext)
}

type DBWatchlistAppSettings = TProvideNumericID &{timestamp:Date} & WatchlistAppSettings

type TState = {
    db:DBManager<DBWatchlistAppSettings>| null
} & WatchlistAppSettings
type TAction = {action:"setApiKey", params:TState["apiKey"]} |
                {action:"setDB", params:DBManager<DBWatchlistAppSettings>}
function useSettingContextProvider() {
    const [{db, apiKey}, dispatch] = useReducer((state:TState, {action,params}:TAction) => {
        switch(action) {
            case "setApiKey": return {...state, apiKey:params}
            case "setDB": return {...state, db:params}
        }
    },{
        db:null,
        apiKey:null
    })

    useEffect(()=>{ // db connection
        mkDBManager<DBWatchlistAppSettings>(DB_NAME_SETTINGS, "settings", DB_VERSION_SETTINGS, [{indexName:"id", isUnique:true}, {indexName:"timestamp", isUnique:true}] )
            .then(newDb=> {
                // TODO which is better, fetching all in a single effect or having multiple dependent effects....?
                //newDb.list()
                //    .catch(reason => {
                //        console.error(reason)
                //        throw new Error("Cannot connect to Database, please try later.")
                //    })
                //    .then(settings => { 
                //        if(settings && settings.length>0) {
                //            // get the newest on
                //            const newestSetting = settings.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
                //            console.info(`fetched settings from save date ${newestSetting.timestamp} with id ${newestSetting.id}`)
                //            dispatch({action:"setApiKey", params:newestSetting.apiKey})
                //        } else {
                //            console.warn("no settings loaded")
                //        }
                //    })
                dispatch({action:"setDB", params:newDb})})
            .catch(reason => {
                console.error(reason)
                throw new Error("Cannot connect to Database, please try later.")
            })
    },[])

    useEffect(() => { // after db connection established fetch api key from db
        if(db) {
            db.list()
            .catch(reason => {
                console.error(reason)
                throw new Error("Cannot connect to Database, please try later.")
            })
            .then(settings => { 
                if(settings && settings.length>0) {
                    // get the newest one - even if i clear all older entries, but i don't know if this remains in future, so caring for the most current entry does not harm
                    const newestSetting = settings.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
                    console.info(`fetched settings from save date ${newestSetting.timestamp} with id ${newestSetting.id}`)
                    dispatch({action:"setApiKey", params:newestSetting.apiKey})
                } else {
                    console.warn("no settings loaded")
                }
            })
        } else {
            console.warn("no db conection to settings db, cannot fetch settings, severe error")
            //throw new Error("Cannot connect to Database, please try later.")
        }
    },[db])

    function saveApiKey(apiKey:string) {
        if(db) {
            db.clearAll()
                .catch(reason => {
                    console.error(reason)
                    throw new Error("Cannot connect to Database, please try later.")
                })
                .then(()=> {
                    db.add({timestamp:new Date(), apiKey:apiKey})
                        .catch(reason => {
                            console.error(reason)
                            throw new Error("Saving the settings failed, severe error, try again later.")
                        })
                        .then(newId => {
                    dispatch({action:"setApiKey", params:apiKey})
                            console.info(`new settings entry with id ${newId} saved successfully.`)
                        })
                })
        } else {
            console.error("db is not set")
            throw new Error("Not connected to Database, please try later.")
        }
    }
    return {apiKey, saveApiKey} as SettingsContextRecord
}