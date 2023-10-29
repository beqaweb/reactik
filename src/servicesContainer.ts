import {
  PropsWithChildren,
  createContext,
  createElement,
  useContext,
  useMemo,
} from 'react';

type ValidServiceType = () => Object | Promise<Object>;
type Services = Record<string, ValidServiceType>;

interface ServiceContainerContextType<T> {
  services: T;
}

const ServiceContainerContext = createContext<
  ServiceContainerContextType<Services>
>({
  services: {},
});

interface ServicesContextProviderProps<T extends Services = Services>
  extends PropsWithChildren {
  services: T;
}

export const ServicesProvider: React.FC<ServicesContextProviderProps> = (
  props,
) => {
  const { children, services } = props;
  const value = useMemo(() => ({ services }), [services]);
  return createElement(ServiceContainerContext.Provider, { value }, children);
};

interface CreateServiceContainerOptions<T extends Services> {
  services: T;
}

interface ServiceContainer<T extends Services> {
  services: T;
  useService: <K extends keyof T>(
    identifier: K,
  ) => ReturnType<ValidServiceType>;
}

export const createServiceContainer = <T extends Services>(
  options: CreateServiceContainerOptions<T>,
): ServiceContainer<T> => {
  const { services } = options;

  const useService = <K extends keyof T>(identifier: K) => {
    const { services } = useContext(ServiceContainerContext);
    const result = useMemo(() => {
      const initService = (services as T)[identifier] as T[K];
      return initService(); // initialize a service
    }, [services, identifier]);
    return result;
  };

  return {
    services,
    useService,
  };
};
