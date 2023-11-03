import { useCallback, useMemo, useRef, useState } from 'react';

import { Progress } from './progress';

type InvokeCleanup = () => void;

type ExtractResolveType<F> = F extends (...args: any[]) => Promise<infer T>
  ? T
  : F extends (...args: any[]) => Progress<infer T, any>
  ? T
  : any;

type ExtractRejectType<F> = F extends (
  ...args: any[]
) => Progress<infer T, infer E>
  ? E
  : any;

type ServiceHandler<
  F extends (...args: any[]) => any,
  T = ExtractResolveType<F>,
  E = ExtractRejectType<F>,
> = [
  (...args: Parameters<F>) => InvokeCleanup, // invoke function
  {
    isLoading: boolean;
    response: T | null;
    error: E | null;
  }, // state
];

const useServiceHandler = <
  F extends (...args: any[]) => Promise<any> | Progress<any, any>,
>(
  serviceMethod: F,
): ServiceHandler<F> => {
  const serviceMethodInitial = useRef(serviceMethod).current;

  // index 1 in ServiceHandler<F> is the state type
  const [state, setState] = useState<ServiceHandler<F>[1]>({
    isLoading: false,
    response: null,
    error: null,
  });

  const invoke = useCallback(
    (...args: Parameters<F>) => {
      setState((currentState) => ({
        ...currentState,
        isLoading: true,
      }));

      const promiseOrProgress = serviceMethodInitial(...args);

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

      return () => undefined;
    },
    [serviceMethodInitial],
  );

  return useMemo(() => [invoke, state], [invoke, state]);
};

export { useServiceHandler };
