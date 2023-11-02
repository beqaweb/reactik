import { useCallback, useMemo, useState } from 'react';

import { Progress } from './progress';

interface ServiceHandlerState<T, E = unknown> {
  isLoading: boolean;
  response: T | undefined;
  error: E | undefined;
}

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
  ServiceHandlerState<T, E>, // state
];

const useServiceHandler = <
  F extends (...args: any[]) => Promise<any> | Progress<any, any>,
>(
  serviceMethod: F,
): ServiceHandler<F> => {
  const [state, setState] = useState<
    ServiceHandlerState<ExtractResolveType<F>, ExtractRejectType<F>>
  >({
    isLoading: false,
    response: undefined,
    error: undefined,
  });

  const invoke = useCallback(
    (...args: Parameters<F>) => {
      setState((currentState) => ({
        ...currentState,
        isLoading: true,
      }));

      const promiseOrProgress = serviceMethod(...args);

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
    [serviceMethod],
  );

  return useMemo(() => [invoke, state], [invoke, state]);
};

export { useServiceHandler };
