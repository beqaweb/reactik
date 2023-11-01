export interface ProgressSubscription {
  unsubscribe: () => void;
}

interface SubscribeOptions<T, E = unknown> {
  onEmit?: (result: T) => void;
  onError?: (error: E) => void;
  onFinish?: () => void;
}

export class Progress<T, E = unknown> {
  private _emitCallbacks: Array<(result: T) => void> = [];
  private _errorCallbacks: Array<(error: E) => void> = [];
  private _finishCallbacks: Array<() => void> = [];
  private _lastResult: T | undefined;
  private _error: E | undefined;
  private _finished: boolean = false;

  constructor(
    resolver: (
      emit: (result: T) => void,
      reject: (error: E) => void,
      finish: () => void,
    ) => void,
  ) {
    resolver(this._emit, this._reject, this._finish);
  }

  get lastResult() {
    return this._lastResult;
  }

  get error() {
    return this._error;
  }

  private _emit(result: T) {
    if (this._finished) {
      throw new Error('Cannot emit a new value to the progress once finished.');
    }
    this._emitCallbacks.forEach((onEmit) => onEmit(result));
    this._lastResult = result;
  }

  private _reject(error: E) {
    if (this._finished) {
      throw new Error('Cannot reject the progress once finished.');
    }
    this._error = error;
    this._errorCallbacks.forEach((onError) => onError(error));
    this._emitCallbacks = [];
    this._errorCallbacks = [];
    this._finishCallbacks = [];
  }

  private _finish() {
    if (this._finished) {
      throw new Error('The progress was already finished.');
    }
    this._finished = true;
    this._finishCallbacks.forEach((onFinish) => onFinish());
    this._emitCallbacks = [];
    this._errorCallbacks = [];
    this._finishCallbacks = [];
  }

  subscribe({
    onEmit,
    onError,
    onFinish,
  }: SubscribeOptions<T, E>): ProgressSubscription {
    if (onEmit && !this._emitCallbacks.includes(onEmit)) {
      this._emitCallbacks.push(onEmit);
    }
    if (onError && !this._errorCallbacks.includes(onError)) {
      this._errorCallbacks.push(onError);
    }
    if (onFinish && !this._finishCallbacks.includes(onFinish)) {
      this._finishCallbacks.push(onFinish);
    }

    return {
      unsubscribe: () => {
        if (onEmit) {
          this._emitCallbacks.splice(this._emitCallbacks.indexOf(onEmit), 1);
        }
        if (onError) {
          this._errorCallbacks.splice(this._errorCallbacks.indexOf(onError), 1);
        }
        if (onFinish) {
          this._finishCallbacks.splice(
            this._finishCallbacks.indexOf(onFinish),
            1,
          );
        }
      },
    };
  }
}
