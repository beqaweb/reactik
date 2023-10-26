import React from 'react';
import { createServiceContainer } from 'reactik';

interface Props extends React.PropsWithChildren {}

const container = createServiceContainer({
  services: {},
});

export function App({ children }: Props) {
  return (
    <div>
      <h1>Reactik app</h1>
    </div>
  );
}
