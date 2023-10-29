const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
const generateId = () => `${Date.now()}-${Math.random()}`;

export interface Todo {
  id: string;
  title: string;
}

export class TodoService {
  async getTodoList() {
    await sleep(2000);
    return {
      items: [
        {
          id: generateId(),
          title: 'Todo 1',
        },
        {
          id: generateId(),
          title: 'Todo 2',
        },
        {
          id: generateId(),
          title: 'Todo 3',
        },
      ] as Todo[],
    };
  }
}
