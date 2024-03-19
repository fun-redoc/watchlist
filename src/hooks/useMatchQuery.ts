export function matchQuery<T extends object>(x:T, q:string) {
    const ql = q.toLowerCase()
  return Object.keys(x).reduce((match, k) => 
                      {
                        const v = x[k as keyof T]
                        if(typeof v === "string") {
                          const vl = v.toLowerCase()
                          return match || (vl.indexOf(ql) !== -1)
                        } else {
                          return match
                        }
                      }
                  , false)
}
