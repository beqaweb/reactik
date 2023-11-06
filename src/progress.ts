const generateId = () => `${Date.now()}-${Math.random()}`;

type SubId = ReturnType<typeof generateId>;

type Cleanup = () => void;

interface ProgressSubscription {
  unsubscribe: () => void;
  onUnsubscribe: (listener: () => void) => Cleanup;
}

interface SubscribeListeners<T, E = any> {
  onEmit?: (result: T, iteration?: number) => void;
  onError?: (error: E) => void;
  onFinish?: () => void;
}

class Progress<T, E = any> {
  private resolverCleanup?: void | (() => void);
  private emitCallbacks: Record<
    SubId,
    (result: T, iteration?: number) => Cleanup | void
  > = {};
  private rejectCallbacks: Record<SubId, (error: E) => void> = {};
  private finishCallbacks: Record<SubId, () => void> = {};
  private emitCleanupListeners: Record<SubId, Cleanup> = {};
  private unsubCleanupListeners: Record<SubId, Cleanup[]> = {};
  private lastResult: T | undefined;
  private error: E | undefined;
  private iteration: number = 0;
  public isFinished: boolean = false;

  constructor(
    resolver: (
      emit: (result: T) => void,
      reject: (error: E) => void,
      finish: () => void,
    ) => Cleanup | void,
  ) {
    // setTimeout(() => {
    this.resolverCleanup = resolver(
      this.emit.bind(this),
      this.reject.bind(this),
      this.finish.bind(this),
    );
    // });
  }

  private emit(result: T) {
    if (this.isFinished) {
      throw new Error('Cannot emit a new value to the progress once finished.');
    }
    Object.values(this.emitCleanupListeners).forEach((onCleanup) => {
      onCleanup();
    });
    this.emitCleanupListeners = {};
    Object.entries(this.emitCallbacks).forEach(([subId, onEmit]) => {
      const cleanup = onEmit(result, this.iteration);
      if (cleanup) {
        this.emitCleanupListeners[subId] = cleanup;
      }
    });
    this.lastResult = result;
    this.iteration += 1;
  }

  private reject(error: E) {
    if (this.isFinished) {
      throw new Error('Cannot reject the progress once finished.');
    }
    this.error = error;
    this.isFinished = true;
    Object.values(this.rejectCallbacks).forEach((onError) => onError(error));
  }

  private finish() {
    if (this.isFinished) {
      throw new Error('The progress was already finished.');
    }
    this.isFinished = true;
    Object.values(this.finishCallbacks).forEach((onFinish) => onFinish());
  }

  private deleteCallbacks() {
    this.emitCallbacks = {};
    this.rejectCallbacks = {};
    this.finishCallbacks = {};
    this.emitCleanupListeners = {};
    this.unsubCleanupListeners = {};
  }

  getError() {
    return this.error;
  }

  getLastResult() {
    return this.lastResult;
  }

  stop() {
    // pop the stop logic to the end of call stack
    // to make sure the logic is performed
    // after a potential creation of progress
    // (making sure this.resolverCleanup is not undefined)
    setTimeout(() => {
      this.resolverCleanup && this.resolverCleanup();
      this.finish();
      this.deleteCallbacks();
    });
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
    const subId = generateId();

    this.unsubCleanupListeners[subId] = [];

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

    // if the progress was finished already
    // give the subscriber last results (lastResult or error)
    // and return noop (nothing to clean up),
    // i.e. do not actually add as subscriber
    if (this.isFinished) {
      if (this.error) {
        onErrorFinal && onErrorFinal(this.error);
      } else {
        onEmitFinal && onEmitFinal(this.lastResult as T, this.iteration);
      }

      return {
        unsubscribe: () => undefined,
        onUnsubscribe: () => {
          return () => undefined;
        },
      };
    }

    if (onEmitFinal) {
      this.emitCallbacks[subId] = onEmitFinal;
    }
    if (onErrorFinal) {
      this.rejectCallbacks[subId] = onErrorFinal;
    }
    if (onFinishFinal) {
      this.finishCallbacks[subId] = onFinishFinal;
    }

    return {
      unsubscribe: () => {
        const emitCleanup = this.emitCleanupListeners[subId];
        emitCleanup && emitCleanup();
        if (this.unsubCleanupListeners[subId]) {
          this.unsubCleanupListeners[subId].forEach((onCleanup) => onCleanup());
        }
        delete this.emitCleanupListeners[subId];
        delete this.unsubCleanupListeners[subId];
        delete this.emitCallbacks[subId];
        delete this.rejectCallbacks[subId];
        delete this.finishCallbacks[subId];
      },
      onUnsubscribe: (onCleanup: () => void): Cleanup => {
        if (!this.unsubCleanupListeners[subId]) {
          this.unsubCleanupListeners[subId] = [];
        }
        this.unsubCleanupListeners[subId].push(onCleanup);
        return () => {
          if (this.unsubCleanupListeners[subId]) {
            const listeners = this.unsubCleanupListeners[subId];
            listeners.splice(listeners.indexOf(onCleanup), 1);
          }
        };
      },
    };
  }

  chain<CT, CE = any>(progress: (result: T) => Progress<CT, CE>) {
    return new Progress<CT, CE | E>((emit, reject, finish) => {
      const sub = this.subscribe(
        (result) => {
          const childProgress = progress(result);

          const childProgressSub = childProgress.subscribe(
            (childResult) => {
              emit(childResult);
            },
            (error) => {
              reject(error);
            },
            () => {
              if (!this.isFinished) {
                this.finish();
              }
              finish();
            },
          );

          return () => {
            childProgress.stop();
            childProgressSub.unsubscribe();
          };
        },
        (error) => {
          reject(error);
        },
      );

      return () => {
        this.stop();
        sub.unsubscribe();
      };
    });
  }
}

class ProgressController<T, E = any> {
  private emitCallbacks: Array<(result: T, iteration?: number) => void> = [];
  private rejectCallbacks: Array<(error: E) => void> = [];
  private finishCallbacks: Array<() => void> = [];

  public lastResult?: T;
  public error?: E;
  public isFinished: boolean = false;

  public emit(result: T) {
    if (this.isFinished) {
      throw new Error('Cannot emit a new value to the progress once finished.');
    }
    this.emitCallbacks.forEach((onEmit) => onEmit(result));
    this.lastResult = result;
  }

  public reject(error: E) {
    if (this.isFinished) {
      throw new Error('Cannot reject the progress once finished.');
    }
    this.rejectCallbacks.forEach((onReject) => onReject(error));
    this.error = error;
  }

  public finish() {
    if (this.isFinished) {
      throw new Error('The progress was already finished.');
    }
    this.isFinished = true;
    this.finishCallbacks.forEach((onFinish) => onFinish());
  }

  public asProgress() {
    return new Progress<T, E>((emit, reject, finish) => {
      this.emitCallbacks.push(emit);
      this.rejectCallbacks.push(reject);
      this.finishCallbacks.push(finish);
      return () => {
        this.emitCallbacks.splice(this.emitCallbacks.indexOf(emit), 1);
        this.rejectCallbacks.splice(this.rejectCallbacks.indexOf(reject), 1);
        this.finishCallbacks.splice(this.finishCallbacks.indexOf(finish), 1);
      };
    });
  }
}

export { Progress, type ProgressSubscription, ProgressController };
