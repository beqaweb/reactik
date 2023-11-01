import { ComponentType, FC, PropsWithChildren } from 'react';

// Modal types

interface DefaultModalProps {
  open: boolean;
}

export interface ModalProps<D = undefined, R = undefined> {
  data: D;
  modalProps: DefaultModalProps;
  close: (result?: R) => void;
}

interface ModalProviderProps extends PropsWithChildren {
  maxModals?: number;
}

export declare const ModalProvider: FC<ModalProviderProps>;

interface UseModalOptions<D> {
  modalId?: string;
  data?: D;
}

interface ModalState {
  open: boolean;
  data: unknown;
}

interface UseModal<D, R> {
  state: ModalState;
  controls: {
    open: (data?: D) => Promise<R>;
    close: (result?: R) => void;
  };
}

export declare const useModal: <D, R>(
  modalComponent: ComponentType<ModalProps<D, R>>,
  options?: UseModalOptions<D>,
) => UseModal<D, R>;

// Service types

type ValidServiceType = () => Object | Promise<Object>;
type Services = Record<string, ValidServiceType>;

interface ServicesContextProviderProps<T extends Services = Services>
  extends PropsWithChildren {
  services: T;
}

export declare const ServicesProvider: FC<ServicesContextProviderProps>;

interface CreateServiceContainerOptions<T extends Services> {
  services: T;
}

interface ServiceContainer<T extends Services> {
  services: T;
  useService: <K extends keyof T>(identifier: K) => ReturnType<T[K]>;
}

export declare const createServiceContainer: <T extends Services>(
  options: CreateServiceContainerOptions<T>,
) => ServiceContainer<T>;

// Service handler types

export interface ServiceHandlerState<T, E = undefined> {
  isLoading: boolean;
  response: T | null;
  error: E | null;
}

export interface ServiceHandler<T, E = undefined> {
  invoke: () => void;
  state: ServiceHandlerState<T, E>;
}
