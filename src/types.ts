import { PropsWithChildren, ComponentType } from 'react';

type ValidServiceType = () => Object | Promise<Object>;
type Services = Record<string, ValidServiceType>;

interface ServicesContextProvider<T extends Services>
  extends PropsWithChildren {
  services: T;
}

export declare const ServicesProvider: <T extends Services>(
  props: ServicesContextProvider<T>,
) => ComponentType;

interface CreateServiceContainerOptions<T extends Services> {
  services: T;
}

interface ServiceContainer<T extends Services> {
  services: T;
  useService: <K extends keyof T>(
    identifier: K,
  ) => ReturnType<ValidServiceType>;
}

export declare const createServiceContainer: <T extends Services>(
  options: CreateServiceContainerOptions<T>,
) => ServiceContainer<T>;
