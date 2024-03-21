import { useEffect, useState } from "react";
import {
  DBManager,
  IndexProps,
  TProvideNumericID,
  mkDBManager,
} from "../dbmanagement/DBManager";

export function useIndexDB<T extends TProvideNumericID>(
  {
    dbname,
    store,
    version,
  }: { dbname: string; store: string; version: number },
  indizes?: IndexProps[],
) {
  const [dbmanager, setDbmanager] = useState<DBManager<T> | undefined>(
    undefined,
  );

  useEffect(() => {
    (async () => {
      const dbm = await mkDBManager<T>(dbname, store, version, indizes);
      setDbmanager(dbm);
    })();
  }, []);

  return dbmanager;
}
