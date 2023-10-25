import {
  PropsWithChildren,
  createContext,
  createElement,
  useContext,
  useMemo,
} from "react";

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

interface ServicesContextProvider<T extends Services>
  extends PropsWithChildren {
  services: T;
}

export const ServicesProvider = <T extends Services>({
  children,
  services,
}: ServicesContextProvider<T>) => {
  const value = useMemo(() => ({ services }), [services]);

  return createElement(ServiceContainerContext.Provider, { value }, children);
};

interface CreateServiceContainerOptions<T extends Services> {
  services: T;
}

export const createServiceContainer = <T extends Services>({
  services,
}: CreateServiceContainerOptions<T>) => {
  const useService = <K extends keyof T>(identifier: K) => {
    const { services } = useContext(ServiceContainerContext);
    const getService = useMemo(
      () => (services as T)[identifier],
      [services, identifier]
    );
    const result = useMemo(() => getService(), [getService]);
    return result as ReturnType<typeof getService>;
  };

  return {
    services,
    useService,
  };
};
