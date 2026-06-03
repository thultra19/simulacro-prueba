const BASE_URL = 'http://localhost:3000';

export const API = {
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/users?email=${email}&password=${password}`);
    if (!res.ok) throw new Error('Network fault detected.');
    const data = await res.json();
    return data.length > 0 ? data[0] : null;
  },

  async getUsers() {
    const res = await fetch(`${BASE_URL}/users`);
    return res.json();
  },

  async getProjects() {
    const res = await fetch(`${BASE_URL}/projects`);
    return res.json();
  },

  async createProject(payload) {
    const res = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async updateProject(id, payload) {
    const res = await fetch(`${BASE_URL}/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async deleteProject(id) {
    const res = await fetch(`${BASE_URL}/projects/${id}`, { method: 'DELETE' });
    return res.ok;
  }
};
