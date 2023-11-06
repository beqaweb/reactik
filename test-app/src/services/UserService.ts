import { HttpClient, Progress, ProgressController } from 'reactik';

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
    return this.getUsers().chain(({ data }) => this.getUser(data[0].id));
  };
}

interface BaseUser {
  id: number;
}

interface UserProfile extends BaseUser {
  name: string;
}

interface UserAvatar extends UserProfile {
  url: string;
}

const p1 = () =>
  new Progress<BaseUser>((emit, reject, finish) => {
    let i = 1;
    const int = setInterval(() => {
      if (i === 3) {
        finish();
        clearInterval(int);
      } else {
        // console.log('emitting p1');
        emit({
          id: i,
        });
      }

      i += 1;
    }, 3000);

    return () => {
      // console.log('cleanup p1');
      clearInterval(int);
    };
  });

const p2 = (baseUser: BaseUser) =>
  new Progress<UserProfile>((emit, reject, finish) => {
    const int = setInterval(() => {
      // console.log('emitting p2');
      emit({
        ...baseUser,
        name: 'John Doe',
      });
    }, 1500);

    return () => {
      // console.log('cleanup p2');
      clearInterval(int);
    };
  });

const p3 = (profile: UserProfile) =>
  new Progress<UserAvatar>((emit, reject, finish) => {
    // console.log('emitting p3');
    emit({
      ...profile,
      url: 'https://google.com/image.jpg',
    });

    return () => {
      // console.log('cleanup p3');
    };
  });

const pChain = p1()
  .chain((baseUser) => p2(baseUser))
  .chain((profile) => p3(profile))
  .subscribe({
    onEmit: (userProfile) => {
      console.log('chain result', userProfile);
    },
    onError: (err) => {
      console.log('chain error', err);
    },
    onFinish: () => {
      console.log('chain finished');
    },
  });
