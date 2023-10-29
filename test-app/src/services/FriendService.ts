const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
const generateId = () => `${Date.now()}-${Math.random()}`;

export interface Friend {
  id: string;
  name: string;
}

export class FriendService {
  async getFriendList(): Promise<{ items: Friend[] }> {
    await sleep(2000);
    return {
      items: [
        {
          id: generateId(),
          name: 'John Doe',
        },
        {
          id: generateId(),
          name: 'Ben Doe',
        },
        {
          id: generateId(),
          name: 'Joel McDonalds',
        },
      ],
    };
  }
}
