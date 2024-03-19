import { useState } from "react";

/**
 * with this you can throw errors to be catched from ErrorBoundry
 * from within callbacks
 * look at the component ErrorBoundary
 * 
 * @returns a hook which helps throwing errors and trigger rerendering in the ErrorBoundry
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export default function useReactCallbackThrow(callback:Function) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setThrow] = useState();
  return (...args:unknown[]) => {
    try {
      callback(...args);
    } catch(e) {
      setThrow(() => {throw e});
    }
  }
}