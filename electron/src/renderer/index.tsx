import { createRoot } from 'react-dom/client';
import App from './App';
import AppStore from './store/app';
import AppContext from './utils/contex';
import AppApi from './api/app';

const store = new AppStore();
const api = new AppApi(store);
const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <AppContext.Provider value={{ store, api }}>
    <App />
  </AppContext.Provider>,
);
