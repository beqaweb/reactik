import { useCallback, useMemo, useState } from 'react';

import { Progress } from './progress';

interface ServiceHandlerState<T, E = unknown> {
  isLoading: boolean;
  response: T | null;
  error: E | null;
}

interface ServiceHandler<T, E = unknown> {
  invoke: () => void;
  state: ServiceHandlerState<T, E>;
}

const useServiceHandler = <T, E = unknown>(
  serviceMethod: () => Promise<T> | Progress<T, E>, // TODO: handle args
): ServiceHandler<T, E> => {
  const [state, setState] = useState<ServiceHandlerState<T, E>>({
    isLoading: false,
    response: null,
    error: null,
  });

  const invoke = useCallback<() => void | (() => void)>(() => {
    setState((currentState) => ({
      ...currentState,
      isLoading: true,
    }));

    const promiseOrProgress = serviceMethod();

    if (promiseOrProgress instanceof Promise) {
      promiseOrProgress
        .then((result) => {
          setState((currentState) => ({
            ...currentState,
            isLoading: false,
            response: result,
          }));
        })
        .catch((error) => {
          setState((currentState) => ({
            ...currentState,
            isLoading: false,
            error: error,
          }));
        });
    } else if (promiseOrProgress instanceof Progress) {
      const subscription = promiseOrProgress.subscribe({
        onEmit: (result) => {
          setState((currentState) => ({
            ...currentState,
            isLoading: false,
            response: result,
          }));
        },
        onError: (error) => {
          setState((currentState) => ({
            ...currentState,
            isLoading: false,
            error: error,
          }));
        },
      });

      return subscription.unsubscribe;
    } else {
      throw new Error(
        'Cannot handle the service method. Should return either Promise or Progress',
      );
    }
  }, [serviceMethod]);

  return useMemo(
    () => ({
      invoke,
      state,
    }),
    [invoke, state],
  );
};

export { useServiceHandler };
