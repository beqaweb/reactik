interface ProgressSubscription {
  unsubscribe: () => void;
}

interface SubscribeListeners<T, E = unknown> {
  onEmit?: (result: T, iteration?: number) => void;
  onError?: (error: E) => void;
  onFinish?: () => void;
}

class Progress<T, E = unknown> {
  private emitCallbacks: Array<(result: T, iteration?: number) => void> = [];
  private errorCallbacks: Array<(error: E) => void> = [];
  private finishCallbacks: Array<() => void> = [];
  private lastResult: T | undefined;
  private error: E | undefined;
  private finished: boolean = false;
  private iteration: number = 0;

  constructor(
    resolver: (
      emit: (result: T) => void,
      reject: (error: E) => void,
      finish: () => void,
    ) => void,
  ) {
    setTimeout(() => {
      resolver(
        this.emit.bind(this),
        this.reject.bind(this),
        this.finish.bind(this),
      );
    });
  }

  private emit(result: T) {
    if (this.finished) {
      throw new Error('Cannot emit a new value to the progress once finished.');
    }
    this.emitCallbacks.forEach((onEmit) => onEmit(result, this.iteration));
    this.lastResult = result;
    this.iteration += 1;
  }

  private reject(error: E) {
    if (this.finished) {
      throw new Error('Cannot reject the progress once finished.');
    }
    this.error = error;
    this.errorCallbacks.forEach((onError) => onError(error));
    this.emitCallbacks = [];
    this.errorCallbacks = [];
    this.finishCallbacks = [];
  }

  private finish() {
    if (this.finished) {
      throw new Error('The progress was already finished.');
    }
    this.finished = true;
    this.finishCallbacks.forEach((onFinish) => onFinish());
    this.emitCallbacks = [];
    this.errorCallbacks = [];
    this.finishCallbacks = [];
  }

  getError() {
    return this.error;
  }

  getLastResult() {
    return this.lastResult;
  }

  subscribe(
    onEmit: (result: T) => void,
    onError?: (error: E) => void,
    onFinish?: () => void,
  ): ProgressSubscription;

  subscribe(listeners: SubscribeListeners<T, E>): ProgressSubscription;

  subscribe(
    listenersOrOnEmit:
      | SubscribeListeners<T, E>
      | ((result: T, iteration?: number) => void),
    onError?: (error: E) => void,
    onFinish?: () => void,
  ): ProgressSubscription {
    const onEmitFinal =
      typeof listenersOrOnEmit === 'object'
        ? listenersOrOnEmit.onEmit
        : listenersOrOnEmit;

    const onErrorFinal =
      typeof listenersOrOnEmit === 'object'
        ? listenersOrOnEmit.onError
        : onError;

    const onFinishFinal =
      typeof listenersOrOnEmit === 'object'
        ? listenersOrOnEmit.onFinish
        : onFinish;

    if (onEmitFinal && !this.emitCallbacks.includes(onEmitFinal)) {
      this.emitCallbacks.push(onEmitFinal);
    }
    if (onErrorFinal && !this.errorCallbacks.includes(onErrorFinal)) {
      this.errorCallbacks.push(onErrorFinal);
    }
    if (onFinishFinal && !this.finishCallbacks.includes(onFinishFinal)) {
      this.finishCallbacks.push(onFinishFinal);
    }

    return {
      unsubscribe: () => {
        if (onEmitFinal) {
          this.emitCallbacks.splice(this.emitCallbacks.indexOf(onEmitFinal), 1);
        }
        if (onErrorFinal) {
          this.errorCallbacks.splice(
            this.errorCallbacks.indexOf(onErrorFinal),
            1,
          );
        }
        if (onFinishFinal) {
          this.finishCallbacks.splice(
            this.finishCallbacks.indexOf(onFinishFinal),
            1,
          );
        }
      },
    };
  }
}

export { Progress, type ProgressSubscription };
