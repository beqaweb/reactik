import { Progress } from './progress';

interface Params {
  [key: string]: string | number | boolean;
}
interface RequestData {
  [key: string]: string | number | boolean | File;
}
type AuthType = 'basic' | 'bearer';
type DataType = 'text' | 'json';
type ContentType = 'text' | 'json';

const stringifyParamsObj = (params: Params = {}): string => {
  const entries = Object.entries(params);
  const parametrized = entries.reduce<string[]>((acc, [key, value]) => {
    return [...acc, `${key}=${value.toString()}`];
  }, []);
  return (entries.length > 0 ? '?' : '') + parametrized.join('&');
};

const fixPathParamsInUrl = (url: string, params: Params = {}): string => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    const paramPlaceholder = `{${key}}`;
    if (url.includes(paramPlaceholder)) {
      return acc.replace(paramPlaceholder, value.toString());
    }
    return acc;
  }, url);
};

// Fetch API

const hasReuqestDataFiles = (data: RequestData): boolean => {
  return Object.values(data).some((item) => item instanceof File);
};

const toFormData = (data: RequestData): FormData => {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    fd.append(key, value instanceof File ? value : value.toString());
  });
  return fd;
};

const convertDataToRequestBody = (
  data: RequestData | string,
): string | FormData => {
  if (typeof data === 'string') {
    return data;
  }
  if (hasReuqestDataFiles(data)) {
    return toFormData(data);
  }
  return JSON.stringify(data);
};

interface RequestOptions {
  url: string;
  type: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  uriParams?: Params;
  pathParams?: Params;
  data?: RequestData | string;
  contentType?: ContentType;
  accept?: ContentType;
  auth?: boolean;
  authToken?: string;
}

const createRequest = <T = any, E = any>(
  options: RequestOptions,
): Progress<T, E> => {
  return new Progress((emit, reject, finish) => {
    const method = options.type;

    const urlAndPath = fixPathParamsInUrl(options.url, options.pathParams);

    const uriParams = options.uriParams
      ? stringifyParamsObj(options.uriParams)
      : '';

    const url = `${urlAndPath}${uriParams}`;

    const body = options.data ? convertDataToRequestBody(options.data) : null;

    const headers: Headers = new Headers();

    if (options.auth) {
      if (options.authToken) {
        headers.set('Authorization', options.authToken);
      } else {
        throw new Error(
          'Request could not be authorized, because authToken is undefined.',
        );
      }
    }

    if (options.contentType === 'text') {
      headers.set('content-type', 'application/x-www-form-urlencoded');
    } else if (options.contentType === 'json') {
      headers.set('content-type', 'application/json');
    }

    if (options.accept === 'text') {
      headers.set('accept', 'application/x-www-form-urlencoded');
    } else if (options.accept === 'json') {
      headers.set('accept', 'application/json');
    } else {
      // default to */*
      headers.set('accept', '*/*');
    }

    (async () => {
      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
        });

        let finalResponse: T;
        try {
          finalResponse = await response.json();
        } catch (e) {
          finalResponse = (await response.text()) as T;
        }

        emit(finalResponse);
        finish();
      } catch (e: any) {
        reject(e);
        finish();
      }
    })();
  });
};

// Http client

interface HttpClientOptions {
  baseURL?: string;
  authType?: AuthType;
  contentType?: ContentType;
  accept?: ContentType;
}

interface ReuqestOptions {
  uriParams?: Params;
  pathParams?: Params;
  contentType?: ContentType;
  accept?: ContentType;
  auth?: boolean;
  authToken?: string;
}

const defaultOptions: HttpClientOptions = {
  baseURL: '',
};

class HttpClient {
  private options: HttpClientOptions;
  private authToken?: string;

  constructor(options?: HttpClientOptions) {
    this.options = Object.assign(defaultOptions, options || {});
  }

  setAuthorizationToken(authToken: string): void;
  setAuthorizationToken(username: string, password: string): void;

  setAuthorizationToken(authTokenOrUsername: string, password?: string) {
    if (this.options.authType === 'basic') {
      if (!password) {
        throw new Error('Password should not be undefined.');
      }
      this.authToken = `Basic ${window.btoa(
        `${authTokenOrUsername}:${password}`,
      )}`;
    }
    if (this.options.authType === 'bearer') {
      this.authToken = `Bearer ${authTokenOrUsername}`;
    }
  }

  GET<T, E = any>(uri: string, options: ReuqestOptions = {}): Progress<T, E> {
    return createRequest<T, E>({
      url: (this.options.baseURL || '') + uri,
      type: 'GET',
      uriParams: options.uriParams || {},
      pathParams: options.pathParams || {},
      contentType: options.contentType || this.options.contentType,
      accept: options.accept,
      auth: Boolean(options.auth),
      authToken: options.authToken || this.authToken,
    });
  }

  POST<T, E = any>(
    uri: string,
    data: RequestData = {},
    options: ReuqestOptions = {},
  ): Progress<T, E> {
    return createRequest<T, E>({
      url: (this.options.baseURL || '') + uri,
      type: 'POST',
      data,
      uriParams: options.uriParams || {},
      pathParams: options.pathParams || {},
      contentType: options.contentType || this.options.contentType,
      accept: options.accept,
      auth: Boolean(options.auth),
      authToken: options.authToken || this.authToken,
    });
  }

  PUT<T, E = any>(
    uri: string,
    data: RequestData = {},
    options: ReuqestOptions = {},
  ): Progress<T, E> {
    return createRequest<T, E>({
      url: (this.options.baseURL || '') + uri,
      type: 'PUT',
      data,
      uriParams: options.uriParams || {},
      pathParams: options.pathParams || {},
      contentType: options.contentType || this.options.contentType,
      accept: options.accept,
      auth: Boolean(options.auth),
      authToken: options.authToken || this.authToken,
    });
  }

  PATCH<T, E = any>(
    uri: string,
    data: RequestData = {},
    options: ReuqestOptions = {},
  ): Progress<T, E> {
    return createRequest<T, E>({
      url: (this.options.baseURL || '') + uri,
      type: 'PATCH',
      data,
      uriParams: options.uriParams || {},
      pathParams: options.pathParams || {},
      contentType: options.contentType || this.options.contentType,
      accept: options.accept,
      auth: Boolean(options.auth),
      authToken: options.authToken || this.authToken,
    });
  }

  DELETE<T, E = any>(
    uri: string,
    options: ReuqestOptions = {},
  ): Progress<T, E> {
    return createRequest<T, E>({
      url: (this.options.baseURL || '') + uri,
      type: 'DELETE',
      uriParams: options.uriParams || {},
      pathParams: options.pathParams || {},
      contentType: options.contentType || this.options.contentType,
      accept: options.accept,
      auth: Boolean(options.auth),
      authToken: options.authToken || this.authToken,
    });
  }
}

export { HttpClient };
