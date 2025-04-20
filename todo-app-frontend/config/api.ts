import axios from 'axios';

const API_URL = 'http://192.168.254.113:5000/api';

interface TodoCreateData {
  title: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface TodoUpdateData {
  title?: string;
  completed?: boolean;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const todoApi = {
  getTodos: () => api.get('/todos'),
  createTodo: (title: string, data?: Omit<TodoCreateData, 'title'>) => 
    api.post('/todos', { title, ...data }),
  updateTodo: (id: number, data: TodoUpdateData) =>
    api.put(`/todos/${id}`, data),
  deleteTodo: (id: number) => api.delete(`/todos/${id}`),
};