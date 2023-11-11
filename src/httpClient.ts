import { BehaviorSubject, Observable, mergeMap, tap } from 'rxjs';
import { AjaxResponse, ajax } from 'rxjs/ajax';

const generateId = (): string => `${Math.random()}`.replace('0-', 'http-');

interface Params {
  [key: string]: string | number | boolean;
}
interface RequestData {
  [key: string]: string | number | boolean | File;
}
type AuthType = 'basic' | 'bearer';
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

const headersToObject = (headers: Headers) => {
  return Array.from(headers.entries()).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: value }),
    {},
  );
};

const calculateProgressPercentage = (response: AjaxResponse<any>) => {
  return Math.round(
    response.total === 0 ? 100 : (response.loaded / response.total) * 100,
  );
};

interface BasicAuthCredentials {
  username: string;
  password: string;
}

class RequestObservable<T extends AjaxResponse<any>> extends Observable<T> {
  chain(transfer: (value: T, index: number) => any) {
    return this.pipe(mergeMap(transfer));
  }

  trackUploadProgress(tracker: BehaviorSubject<number>) {
    return this.pipe(
      tap((response) => {
        if (response.type.includes('upload')) {
          tracker.next(calculateProgressPercentage(response));
        }
      }),
    ) as RequestObservable<T>;
  }

  trackDownloadProgress(tracker: BehaviorSubject<number>) {
    return this.pipe(
      tap((response) => {
        if (response.type.includes('download')) {
          tracker.next(calculateProgressPercentage(response));
        }
      }),
    ) as RequestObservable<T>;
  }
}

interface RequestOptions {
  id: string;
  url: string;
  type: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  uriParams?: Params;
  pathParams?: Params;
  data?: RequestData | string;
  headers?: Record<string, any>;
  auth?: boolean;
  authToken?: string | BasicAuthCredentials;
  authType?: AuthType;
  includeUploadProgress?: boolean;
  includeDownloadProgress?: boolean;
}

const createRequest = <T = any>(options: RequestOptions) => {
  return new RequestObservable<AjaxResponse<T>>((sub) => {
    const method = options.type;

    const urlAndPath = fixPathParamsInUrl(options.url, options.pathParams);

    const uriParams = options.uriParams
      ? stringifyParamsObj(options.uriParams)
      : '';

    const url = `${urlAndPath}${uriParams}`;

    const body = options.data ? convertDataToRequestBody(options.data) : null;

    const headers: Record<string, any> = {};

    if (options.auth) {
      if (options.authToken) {
        const authToken = credentialsToAuthorizationToken(
          typeof options.authToken === 'string'
            ? options.authToken
            : {
                username: options.authToken.username,
                password: options.authToken.password,
              },
          options.authType || 'bearer',
        );

        if (authToken) {
          headers['Authorization'] = authToken;
        } else {
          sub.error(
            new Error('Authorization token is not valid.', {
              cause: 'auth_token_error',
            }),
          );
          sub.complete();
          return;
        }
      } else {
        sub.error(
          new Error(
            'Request could not be authorized, because authToken is undefined.',
            { cause: 'no_auth_token_set' },
          ),
        );
        sub.complete();
        return;
      }
    }

    const ajaxSub = ajax<T>({
      url,
      method,
      body,
      headers,
      includeUploadProgress: true,
      includeDownloadProgress: true,
    }).subscribe({
      next: (result) => {
        sub.next(result);
      },
      error: (error) => {
        sub.error(error);
      },
      complete: () => {
        sub.complete();
      },
    });

    sub.add(() => {
      ajaxSub.unsubscribe();
    });
  });
};

// Http client

interface HttpClientOptions {
  baseURL?: string;
  authType?: AuthType;
  headers?: Record<string, any>;
}

interface HttpClientRequestOptions {
  uriParams?: Params;
  pathParams?: Params;
  auth?: boolean;
  authToken?: string | BasicAuthCredentials;
  authType?: AuthType;
  headers?: Record<string, any>;
  includeUploadProgress?: boolean;
  includeDownloadProgress?: boolean;
}

const defaultOptions: HttpClientOptions = {
  baseURL: '',
};

const credentialsToAuthorizationToken = (
  token: string | BasicAuthCredentials,
  authType: AuthType,
): string | undefined => {
  if (authType === 'basic') {
    if (typeof token === 'string') {
      throw new Error(
        'If you choose basic authorization, pass {username: string, password: string} instead of a string.',
      );
    } else if (!token.password) {
      throw new Error(
        'Password should not be undefined in basic authorization.',
      );
    }
    return `Basic ${window.btoa(`${token.username}:${token.password}`)}`;
  } else if (authType === 'bearer') {
    if (typeof token !== 'string') {
      throw new Error('authToken should be string.');
    }
    return `Bearer ${token}`;
  }
  return;
};

class HttpClient {
  private options: HttpClientOptions;
  private authToken?: string;
  private uploadProgress: Record<string, BehaviorSubject<number>> = {};
  private downloadProgress: Record<string, BehaviorSubject<number>> = {};

  constructor(options?: HttpClientOptions) {
    this.options = Object.assign(defaultOptions, options || {});
  }

  setAuthorization(authToken: string): void;
  setAuthorization(username: string, password: string): void;

  setAuthorization(authTokenOrUsername: string, password: string = '') {
    this.authToken = credentialsToAuthorizationToken(
      typeof authTokenOrUsername === 'string'
        ? authTokenOrUsername
        : { username: authTokenOrUsername, password },
      this.options.authType || 'bearer',
    );
  }

  GET<T>(uri: string, options: HttpClientRequestOptions = {}) {
    const id = generateId();

    return createRequest<T>({
      id,
      url: (this.options.baseURL || '') + uri,
      type: 'GET',
      uriParams: options.uriParams || {},
      pathParams: options.pathParams || {},
      headers: options.headers || this.options.headers || {},
      auth: Boolean(options.auth),
      authToken: options.authToken || this.authToken,
      authType: options.authType || this.options.authType,
    });
  }

  POST<T>(
    uri: string,
    data: RequestData = {},
    options: HttpClientRequestOptions = {},
  ) {
    const id = generateId();

    return createRequest<T>({
      id,
      url: (this.options.baseURL || '') + uri,
      type: 'POST',
      data,
      uriParams: options.uriParams || {},
      pathParams: options.pathParams || {},
      headers: options.headers || this.options.headers || {},
      auth: Boolean(options.auth),
      authToken: options.authToken || this.authToken,
      authType: options.authType || this.options.authType,
    });
  }

  PUT<T>(
    uri: string,
    data: RequestData = {},
    options: HttpClientRequestOptions = {},
  ) {
    const id = generateId();

    return createRequest<T>({
      id,
      url: (this.options.baseURL || '') + uri,
      type: 'PUT',
      data,
      uriParams: options.uriParams || {},
      pathParams: options.pathParams || {},
      headers: options.headers || this.options.headers || {},
      auth: Boolean(options.auth),
      authToken: options.authToken || this.authToken,
      authType: options.authType || this.options.authType,
    });
  }

  PATCH<T>(
    uri: string,
    data: RequestData = {},
    options: HttpClientRequestOptions = {},
  ) {
    const id = generateId();

    return createRequest<T>({
      id,
      url: (this.options.baseURL || '') + uri,
      type: 'PATCH',
      data,
      uriParams: options.uriParams || {},
      pathParams: options.pathParams || {},
      headers: options.headers || this.options.headers || {},
      auth: Boolean(options.auth),
      authToken: options.authToken || this.authToken,
      authType: options.authType || this.options.authType,
    });
  }

  DELETE<T>(uri: string, options: HttpClientRequestOptions = {}) {
    const id = generateId();

    return createRequest<T>({
      id,
      url: (this.options.baseURL || '') + uri,
      type: 'DELETE',
      uriParams: options.uriParams || {},
      pathParams: options.pathParams || {},
      headers: options.headers || this.options.headers || {},
      auth: Boolean(options.auth),
      authToken: options.authToken || this.authToken,
      authType: options.authType || this.options.authType,
    });
  }
}

export { RequestObservable, HttpClient, type HttpClientOptions };
