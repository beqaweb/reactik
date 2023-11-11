import { HttpClient } from 'reactik';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export class UserService {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient({
      baseURL: 'https://reqres.in/api',
    });
  }

  getUsers = () => {
    return this.httpClient.GET<{ data: User[] }>('/users');
  };

  getUser = (id: number) => {
    return this.httpClient.GET<{ data: User }>('/users/{id}', {
      pathParams: { id },
    });
  };

  getFirstUser = () => {
    return this.getUsers().chain(({ response }) =>
      this.getUser(response.data[1].id),
    );
  };
}
