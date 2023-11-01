import ReactDOM from 'react-dom/client';
import { ModalProvider, ServicesProvider } from 'reactik';
import { BrowserRouter as Router } from 'react-router-dom';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { App } from './App';
import { serviceContainer } from './services';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <Router>
    <ServicesProvider services={serviceContainer.services}>
      <ModalProvider>
        <App />
      </ModalProvider>
    </ServicesProvider>
  </Router>,
);
