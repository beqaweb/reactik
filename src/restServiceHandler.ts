import { useCallback, useMemo, useRef, useState } from 'react';
import { AjaxResponse } from 'rxjs/ajax';

import { useServiceHandler } from './serviceHandler';
import { RequestObservable } from './httpClient';
import { BehaviorSubject, Subject } from 'rxjs';

type InvokeCleanup = () => void;

type ExtractResolveType<F> = F extends (...args: any[]) => Promise<infer T>
  ? T
  : F extends (...args: any[]) => RequestObservable<AjaxResponse<infer T>>
  ? T
  : any;

type RestServiceHandler<
  F extends (...args: any[]) => RequestObservable<AjaxResponse<any>>,
  T = ExtractResolveType<F>,
> = {
  invoke: (...args: Parameters<F>) => InvokeCleanup;
  state: {
    isLoading: boolean;
    result: T | null;
    error: any;
  };
  onUploadProgress: (onProgress: (value: number) => void) => void;
  onDownloadProgress: (onProgress: (value: number) => void) => void;
};

const useRestServiceHandler = <
  F extends (...args: any[]) => RequestObservable<AjaxResponse<any>>,
>(
  serviceMethod: F,
): RestServiceHandler<F> => {
  const serviceMethodInitial = useRef(serviceMethod).current;

  const uploadProgressTracker = new BehaviorSubject<number>(0);
  const downloadProgressTracker = new BehaviorSubject<number>(0);

  // index 1 in ServiceHandler<F> is the state type
  const [state, setState] = useState<RestServiceHandler<F>['state']>({
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

      const subscription = observable
        .trackDownloadProgress(downloadProgressTracker)
        .subscribe({
          next: (result) => {
            setState((currentState) => ({
              ...currentState,
              isLoading: false,
              result: result.response,
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

  const onDownloadProgress = useCallback(
    (onProgress: (value: number) => void) => {},
    [],
  );

  const onUploadProgress = useCallback(
    (onProgress: (value: number) => void) => {},
    [],
  );

  return useMemo(
    () => ({
      invoke,
      state,
      onDownloadProgress,
      onUploadProgress,
    }),
    [invoke, state],
  );
};

export { useRestServiceHandler };
