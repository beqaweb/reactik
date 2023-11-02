import { Progress } from 'reactik';

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

  watchTodoList(titleFilter?: string): Progress<Todo[], string> {
    return new Progress((emit) => {
      emit(
        [
          {
            id: generateId(),
            title: 'Finish the quarterly report',
          },
        ].filter(
          ({ title }) =>
            typeof titleFilter === 'undefined' || title.includes(titleFilter),
        ),
      );

      setTimeout(() => {
        emit(
          [
            {
              id: generateId(),
              title: 'Finish the quarterly report',
            },
            {
              id: generateId(),
              title: 'Send the marketing proposal to the client',
            },
          ].filter(
            ({ title }) =>
              typeof titleFilter === 'undefined' || title.includes(titleFilter),
          ),
        );
      }, 3000);

      setTimeout(() => {
        emit(
          [
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
          ),
        );
      }, 6000);
    });
  }
}
