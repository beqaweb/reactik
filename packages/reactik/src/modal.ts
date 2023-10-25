import React, {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

interface DefaultModalProps {
  open: boolean;
}

export interface ModalProps<D, R> {
  data: D;
  modalProps: DefaultModalProps;
  close: (result?: R) => void;
}

interface UseModal<D, R> {
  open: (data?: D) => Promise<R>;
  close: (result?: R) => void;
}

interface UseModalOptions<D> {
  modalId?: string;
  data?: D;
}

interface ModalState {
  open: boolean;
  data: unknown;
}

interface ModalContextValue {
  modalStates: {
    [modalId: string]: ModalState;
  };
  modalComponents: {
    [modalId: string]: React.ComponentType;
  };
  modalResolvers: {
    [modalId: string]: (result?: unknown) => void;
  };
  setModalState: (modalId: string, state: ModalState) => void;
  open: (
    modalId: string,
    component: React.ComponentType,
    data: unknown,
    resolver: (result?: unknown) => void
  ) => void;
  close: (modalId: string, result?: unknown) => void;
}

interface ModalProviderProps extends React.PropsWithChildren {
  maxModals?: number; // TODO: implement
}

const generateModalId = (): string => `${Date.now()}-${Math.random()}`;

const ModalContext = createContext<ModalContextValue>({
  modalStates: {},
  modalComponents: {},
  modalResolvers: {},
  setModalState: () => undefined,
  open: () => undefined,
  close: () => undefined,
});

export const ModalProvider: React.ComponentType<ModalProviderProps> = ({
  children,
}) => {
  const modalComponentsRef = useRef<ModalContextValue["modalComponents"]>({});
  const modalResolversRef = useRef<ModalContextValue["modalResolvers"]>({});

  const [modalStates, setModalStates] = useState<
    ModalContextValue["modalStates"]
  >({});

  const setModalState = useCallback((modalId: string, newState: ModalState) => {
    setModalStates((current) => ({
      ...current,
      [modalId]: newState,
    }));
  }, []);

  const open = useCallback(
    (
      modalId: string,
      component: React.ComponentType,
      data: unknown,
      resolver: (result?: unknown) => void
    ) => {
      modalComponentsRef.current = {
        ...modalComponentsRef.current,
        [modalId]: component,
      };
      modalResolversRef.current = {
        ...modalResolversRef.current,
        [modalId]: resolver,
      };
      setModalStates((current) => ({
        ...current,
        [modalId]: {
          open: true,
          data,
          resolver,
        },
      }));
    },
    []
  );

  const close = useCallback((modalId: string, result?: unknown) => {
    setModalStates((current) => ({
      ...current,
      [modalId]: {
        ...current[modalId],
        open: false,
      },
    }));
    modalResolversRef.current[modalId](result);
  }, []);

  const providerValue: ModalContextValue = useMemo(
    () => ({
      modalStates,
      modalComponents: modalComponentsRef.current,
      modalResolvers: modalResolversRef.current,
      setModalState,
      open,
      close,
    }),
    [modalStates, setModalState, open, close]
  );

  const modalsPortalElement = useMemo(() => {
    const div = window.document.createElement("div");
    window.document.body.appendChild(div);
    return div;
  }, []);

  const modals = Object.entries(modalComponentsRef.current).map(
    ([modalId, component]) => {
      const props = {
        key: modalId,
        data: modalStates[modalId].data,
        modalProps: {
          open: modalStates[modalId].open,
        },
        close: (result?: unknown) => close(modalId, result),
      };
      return createElement(component, props);
    }
  );

  const portal = ReactDOM.createPortal(modals, modalsPortalElement);

  return createElement(
    ModalContext.Provider,
    { value: providerValue },
    children,
    portal
  );
};

ModalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useModal = <D, R>(
  modalComponent: React.ComponentType<ModalProps<D, R>>,
  options?: UseModalOptions<D>
): UseModal<D, R> => {
  const context = useContext(ModalContext);

  const modalId = useRef(options?.modalId || generateModalId()).current;

  const close: (result?: R) => void = useCallback((result) => {
    context.close(modalId, result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open: (data?: D) => Promise<R> = useCallback((data) => {
    return new Promise((resolve) => {
      context.open(
        modalId,
        modalComponent as React.ComponentType,
        options?.data || data,
        resolve as (result?: unknown) => void
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useMemo<UseModal<D, R>>(
    () => ({
      close,
      open,
    }),
    [close, open]
  );
};
