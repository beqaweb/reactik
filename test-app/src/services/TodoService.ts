const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
const generateId = () => `${Date.now()}-${Math.random()}`;

export interface Todo {
  id: string;
  title: string;
}

export class TodoService {
  async getTodoList(titleFilter?: string): Promise<Todo[]> {
    await sleep(2000);

    return [
      {
        id: generateId(),
        title: 'Finish the quarterly report',
      },
      {
        id: generateId(),
        title: 'Send the marketing proposal to the client',
      },
      {
        id: generateId(),
        title: 'Schedule a team meeting for next week',
      },
      {
        id: generateId(),
        title: 'Respond to emails',
      },
    ].filter(
      ({ title }) =>
        typeof titleFilter === 'undefined' || title.includes(titleFilter),
    );
  }

  // watchTodoList(titleFilter: string): Progress<> {}
}
