import { useState } from "react";

/**
 * with this yyou can throw errors to be catched from ErrorBoundry
 * look at the component ErrorBoundary
 * 
 * @returns a hook which helps throwing errors and trigger rerendering in the ErrorBoundry
 */
export default function useReactThrow():(error:Error)=>void  {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setThrow] = useState();
  return (error:Error) => {
    setThrow(() => {throw error})
  }
}