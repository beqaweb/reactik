import { useCallback, useMemo, useRef, useState } from 'react';
import { Observable, from } from 'rxjs';

type InvokeCleanup = () => void;

type ExtractResolveType<F> = F extends (...args: any[]) => Promise<infer T>
  ? T
  : F extends (...args: any[]) => Observable<infer T>
  ? T
  : any;

type ServiceHandler<
  F extends (...args: any[]) => any,
  T = ExtractResolveType<F>,
> = {
  invoke: (...args: Parameters<F>) => InvokeCleanup;
  state: {
    isLoading: boolean;
    result: T | null;
    error: any;
  };
};

const useServiceHandler = <
  F extends (...args: any[]) => Promise<any> | Observable<any>,
>(
  serviceMethod: F,
): ServiceHandler<F> => {
  const serviceMethodInitial = useRef(serviceMethod).current;

  // index 1 in ServiceHandler<F> is the state type
  const [state, setState] = useState<ServiceHandler<F>['state']>({
    isLoading: false,
    result: null,
    error: null,
  });

  const invoke = useCallback(
    (...args: Parameters<F>) => {
      setState((currentState) => ({
        ...currentState,
        isLoading: true,
      }));

      let observable = serviceMethodInitial(...args);

      if (observable instanceof Promise) {
        observable = from(observable);
      }

      const subscription = observable.subscribe({
        next: (result) => {
          setState((currentState) => ({
            ...currentState,
            isLoading: false,
            result: result,
          }));
        },
        error: (error) => {
          setState((currentState) => ({
            ...currentState,
            isLoading: false,
            error: error,
          }));
        },
      });

      return () => {
        setState((currentState) => {
          if (currentState.isLoading) {
            return {
              ...currentState,
              isLoading: false,
            };
          }
          // return same state so that the
          // component doesn't rerender
          return currentState;
        });
        subscription.unsubscribe();
      };
    },
    [serviceMethodInitial],
  );

  return useMemo(
    () => ({
      invoke,
      state,
    }),
    [invoke, state],
  );
};

export { useServiceHandler };
