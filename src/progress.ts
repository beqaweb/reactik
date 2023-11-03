const generateId = () => `${Date.now()}-${Math.random()}`;

type SubId = ReturnType<typeof generateId>;

type Cleanup = () => void;

interface ProgressSubscription {
  unsubscribe: () => void;
  onUnsubscribe: (listener: () => void) => void;
}

interface SubscribeListeners<T, E = unknown> {
  onEmit?: (result: T, iteration?: number) => void;
  onError?: (error: E) => void;
  onFinish?: () => void;
}

class Progress<T, E = unknown> {
  private emitCallbacks: Record<
    SubId,
    (result: T, iteration?: number) => Cleanup | void
  > = {};
  private errorCallbacks: Record<SubId, (error: E) => void> = {};
  private finishCallbacks: Record<SubId, () => void> = {};
  private emitCleanupListeners: Record<SubId, Cleanup> = {};
  private unsubCleanupListeners: Record<SubId, Cleanup[]> = {};
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
    Object.values(this.emitCleanupListeners).forEach((onCleanup) => {
      onCleanup && onCleanup();
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
    if (this.finished) {
      throw new Error('Cannot reject the progress once finished.');
    }
    this.error = error;
    Object.values(this.errorCallbacks).forEach((onError) => onError(error));
    this.emitCallbacks = {};
    this.errorCallbacks = {};
    this.finishCallbacks = {};
    this.emitCleanupListeners = {};
    this.unsubCleanupListeners = {};
  }

  private finish() {
    if (this.finished) {
      throw new Error('The progress was already finished.');
    }
    this.finished = true;
    Object.values(this.finishCallbacks).forEach((onFinish) => onFinish());
    this.emitCallbacks = {};
    this.errorCallbacks = {};
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

    if (onEmitFinal) {
      this.emitCallbacks[subId] = onEmitFinal;
    }
    if (onErrorFinal) {
      this.errorCallbacks[subId] = onErrorFinal;
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
        delete this.emitCallbacks[subId];
        delete this.errorCallbacks[subId];
        delete this.finishCallbacks[subId];
        delete this.unsubCleanupListeners[subId];
        delete this.emitCleanupListeners[subId];
      },
      onUnsubscribe: (onCleanup: () => void) => {
        if (!this.unsubCleanupListeners[subId]) {
          this.unsubCleanupListeners[subId] = [];
        }
        this.unsubCleanupListeners[subId].push(onCleanup);
      },
    };
  }
}

export { Progress, type ProgressSubscription };
