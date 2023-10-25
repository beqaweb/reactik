import React from 'react';

interface Props extends React.PropsWithChildren {}

export function App({ children }: Props) {
  return (
    <div>
      <h1>Reactik app</h1>
    </div>
  );
}
