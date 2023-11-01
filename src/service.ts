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

const ServicesProvider: React.FC<ServicesContextProviderProps> = (props) => {
  const { children, services } = props;
  const value = useMemo(() => ({ services }), [services]);
  return createElement(ServiceContainerContext.Provider, { value }, children);
};

interface CreateServiceContainerOptions<T extends Services> {
  services: T;
}

interface ServiceContainer<T extends Services> {
  services: T;
  useService: <K extends keyof T>(identifier: K) => ReturnType<T[K]>;
}

const createServiceContainer = <T extends Services>(
  options: CreateServiceContainerOptions<T>,
): ServiceContainer<T> => {
  const { services } = options;

  const useService = <K extends keyof T>(identifier: K): ReturnType<T[K]> => {
    const context = useContext(ServiceContainerContext);
    const contextServices = context.services as T;

    if (!contextServices.hasOwnProperty(identifier)) {
      throw new Error(
        `'${identifier.toString()}' was not found in the service registry.` +
          ` Services: ${Object.keys(contextServices).join(', ')}`,
      );
    }

    const initService = contextServices[identifier];

    const serviceResult = useMemo(() => initService(), [initService]);

    return serviceResult as ReturnType<T[K]>; // Initialize a service
  };

  return {
    services,
    useService,
  };
};

export { createServiceContainer, ServicesProvider };
