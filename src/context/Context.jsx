import { createContext } from "react";

 export const appContext=createContext(null);

 function GlobalContext({children}){
    return <appContext.Provider value={{}}>{children}</appContext.Provider>
 }

 export default GlobalContext;
