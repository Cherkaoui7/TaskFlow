import api from './api';

export const taskService = {
  async getTasks(projectId) {
    const response = await api.get(`/projects/${projectId}/tasks`);
    return response.data;
  },

  async getTask(id) {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  async createTask(projectId, data) {
    const response = await api.post(`/projects/${projectId}/tasks`, data);
    return response.data;
  },

  async updateTask(id, data) {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  async updateTaskStatus(id, status) {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  async deleteTask(id) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  async getMyTasks() {
    const response = await api.get('/my-tasks');
    return response.data;
  },
};
