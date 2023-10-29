import React from 'react';
import ReactDOM from 'react-dom/client';
import { ServicesProvider } from 'reactik';

import { App } from './App';
import { serviceContainer } from './services';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <ServicesProvider services={serviceContainer.services}>
    <App />
  </ServicesProvider>,
);
