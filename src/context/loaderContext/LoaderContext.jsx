import { createContext, useContext, useMemo, useState } from "react";
import Loader from "../../components/loader";

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const startLoader = () => {
    setLoading(true);
  };

  const stopLoader = () => {
    setLoading(false);
  };

  return (
    <LoaderContext.Provider value={{ startLoader, stopLoader, loading }}>
      {children}
      {loading && <Loader open={loading} />}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  return context;
};
