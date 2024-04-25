import { createContext, useContext } from 'react';
import AppStore from '../store/app';
import AppApi from '../api/app';

interface AppContextType {
  store: AppStore;
  api: AppApi;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  return context as AppContextType;
};

export default AppContext;
