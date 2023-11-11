import { HttpClient } from 'reactik';

export class FileService {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient({
      baseURL: 'https://httpbin.org',
    });
  }

  uploadFile = (file: File) => {
    return this.httpClient.POST<any>('/post', { file });
  };
}
