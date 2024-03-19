export type TWatch = {
        id?:number
} & {
        region: string,
        currency: string,
        shortName: string,
        fullExchangeName: string,
        longName: string,
        marketState: string,
        esgPopulated: boolean,
        tradeable: boolean,
        exchange: string,
        market: string,
        symbol: string
} & {
        name: string,
        exch: string,
        type: string,
        exchDisp: string,
        typeDisp: string,
    }


/**
 * make a Nullable Type from a arbitrary type
 */ 
type Nullable<T> = { [Property in keyof T]: T[Property]  | null };

/**
 * copies parameter values from on object to another when the names of the parameters match
 * it can only shallow copy, 
 * 
 * inspired by good old COBOL, typescript should have such a feature
 * 
 * Caution:
 *  -- this is possibly a dangerous funtion, becauses it messes with the typing 
 *  -- it is slow, ont use in loops
 * 
 * @param Template object must be filled, would like to know how to create such an object automatically
 * @param Source 
 * @returns  Target
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function moveCorresponding<T extends object, S>(Template:T, Source:S):T {
    let res:T = Object.assign({})
    Object.keys(Template).forEach(key => {
        if (Source[key as keyof S] !== undefined)
            res = {...res, [key]:Source[key as keyof S]}
    });
    return res
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function moveCorresponding1(Target, Source) {
    // simple js version, but absolutelly without type savety
    Object.keys(Target).forEach(key => {
        if (Source[key] !== undefined)
            Target[key] = Source[key];
    });
}

export function assign<T>(s:T):TWatch {
    const tn:Nullable<TWatch> =  {
        id:null,
        region:null,
        currency:null,
        shortName:null,
        fullExchangeName:null,
        longName:null,
        marketState:null,
        esgPopulated:null,
        tradeable:null,
        exchange:null,
        market:null,
        symbol:null,
        name:null,
        exch:null,
        type:null,
        exchDisp:null,
        typeDisp:null,
    }
    return moveCorresponding<Nullable<TWatch>,T>(tn, s) as TWatch
}