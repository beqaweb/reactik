import {
  PropsWithChildren,
  createContext,
  createElement,
  useContext,
  useMemo,
} from 'react';

type ValidServiceType = Object;
type ValidServiceInitializerType = () => ValidServiceType;
type Services = Record<string, ValidServiceInitializerType>;

interface ServiceContainerContextValue<T> {
  services: T;
}

interface CreateServiceContainerOptions<T extends Services> {
  /**
   * Object containing service creators where
   * a service can be type of Object
   */
  services: T;
  /**
   * Services specified in this array will be
   * instantiated once and reused
   */
  reused?: Array<keyof T>;
}

interface ServiceContainer<T extends Services> {
  /**
   * Context provider for service container.
   * Use to wrap your component(s) and provide
   * services to them.
   */
  Provider: React.FC<PropsWithChildren>;
  /**
   * React hook to use/reuse a specific service
   * @param identifier Service name. Key from the services
   * object provided into createServiceContainer()
   * @returns Instance of the service
   */
  useService: <K extends keyof T>(identifier: K) => ReturnType<T[K]>;
}

const createServiceContainer = <T extends Services>(
  options: CreateServiceContainerOptions<T>,
): ServiceContainer<T> => {
  const { services, reused } = options;

  const reusableRegistry: Record<string, ValidServiceType> = {};

  const Context = createContext<ServiceContainerContextValue<T>>({
    services,
  });

  const Provider: React.FC<PropsWithChildren> = ({ children }) => {
    // context value created/updated here
    const value = useMemo(() => ({ services }), [services]);
    return createElement(Context.Provider, { value }, children);
  };

  const useService = <K extends keyof T>(identifier: K): ReturnType<T[K]> => {
    const context = useContext(Context);
    const contextServices = context.services;

    if (!contextServices.hasOwnProperty(identifier)) {
      throw new Error(
        `'${identifier.toString()}' was not found in the service registry.` +
          ` Services: ${Object.keys(contextServices).join(', ')}`,
      );
    }

    const initService = contextServices[identifier];

    const serviceResult = useMemo(() => {
      // if service name was added to `reused` array,
      // then create instance once and then reuse it
      if (reused && reused.includes(identifier)) {
        if (!reusableRegistry.hasOwnProperty(identifier)) {
          reusableRegistry[identifier as string] = initService();
        }
        return reusableRegistry[identifier as string] as ReturnType<T[K]>;
      }

      return initService();
    }, [reused, initService]);

    return serviceResult as ReturnType<T[K]>; // Initialize a service
  };

  return {
    Provider,
    useService,
  };
};

export { createServiceContainer };
