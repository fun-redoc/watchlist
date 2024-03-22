/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";

const DB_NAME_CACHE = "cacheDB";
const DB_VERSION_CACHE = 1;

// usage: 
//         const getDAtailsWithCache = useCache<YFinQuoteResult, typeof getDetails>(getDetails);


export default function useCache<RT, FT extends (...args: any) => Promise<RT>>(f:FT,
  cacheParams: { timeOutMillis: number } = { timeOutMillis: 10000}) {
    return useCallback((params:Parameters<FT>) => doCache<RT, FT>(f, params, cacheParams),[f,cacheParams])
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function doCache<RT, FT extends (...args: any) => Promise<RT>>(
  f: FT,
  params: Parameters<FT>,
  cacheParams: { timeOutMillis: number } = { timeOutMillis: 10000},
): Promise<RT> {
  return new Promise<RT>((resolve, reject) => {
    const requestDB = window.indexedDB.open(DB_NAME_CACHE, DB_VERSION_CACHE);
    requestDB.onupgradeneeded = () => {
      const db = requestDB.result;
      db.createObjectStore("cache", { keyPath: "key" });
    };
    requestDB.onsuccess = () => {
      const db = requestDB.result;
      const transaction = db.transaction(["cache"], "readonly");
      const objectStore = transaction.objectStore("cache");
      const request = objectStore.get(params.toString());
      request.onsuccess = async () => {
        const result = request.result;
        if (result) {
          if (Date.now() - result.time < cacheParams.timeOutMillis) {
            console.info("Data fetched from cache")
            resolve( result as RT)
            return
          }
        }
        const promise = f(...params);
        return promise
          .catch(reason => {
            console.error("Failed to fatch value, with reason:", reason)
            reject(reason)
          })
          .then(value => {
            if(value) {
              const transactionWrite = db.transaction(["cache"], "readwrite");
              const objectStoreWrtie = transactionWrite.objectStore("cache");
              const requestPut = objectStoreWrtie.put({ ...value, time: Date.now(), key: params.toString() });
              transactionWrite.commit()
              requestPut.onerror = ()=> {console.error(requestPut.error)}
              requestPut.onsuccess = ()=> {console.info("Data stored in cache.")}
              resolve(value)
            } else {
              reject("no result fetched")
            } 
          })
      };
      request.onerror = () => {
        console.error("No cache available, error:", request.error);
        f(...params)
        .catch(reason=>reject(reason))
        .then(result=> {
                          if(result) {
                            resolve(result)
                          } else {
                            reject("no result fetched")
                          } 
                        })
      };
    };
    requestDB.onerror = () => {
      console.error("No cache DB available, error:", requestDB.error);
      f(...params)
        .catch(reason=>reject(reason))
        .then(result=> {
                          if(result) {
                            resolve(result)
                          } else {
                            reject("no result fetched")
                          } 
                        })
    };
  })
}