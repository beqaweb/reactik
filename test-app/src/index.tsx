import ReactDOM from 'react-dom/client';
import { ModalProvider } from 'reactik';
import { BrowserRouter as Router } from 'react-router-dom';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { serviceContainer } from './services';
import { App } from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <Router>
    <serviceContainer.Provider>
      <ModalProvider>
        <App />
      </ModalProvider>
    </serviceContainer.Provider>
  </Router>,
);
