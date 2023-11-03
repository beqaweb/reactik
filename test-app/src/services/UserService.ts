import { HttpClient } from 'reactik';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export class UserService {
  private httpClient = new HttpClient({
    baseURL: 'https://reqres.in/api',
  });

  getUser = (id: number) => {
    return this.httpClient.GET<{ data: User }>('/users/{id}', {
      pathParams: { id },
    });
  };

  getUsers = () => {
    return this.httpClient.GET<{ data: User[] }>('/users');
  };
}
