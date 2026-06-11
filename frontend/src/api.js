const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function api(path, options = {}) {
  const token = localStorage.getItem('construsys_token');
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || data.message || 'Error en la API');
  return data;
}

export const list = (resource, search = '') => api(`/${resource}${search ? `?search=${encodeURIComponent(search)}` : ''}`);
export const create = (resource, body) => api(`/${resource}`, { method: 'POST', body: JSON.stringify(body) });
export const update = (resource, id, body) => api(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const remove = (resource, id) => api(`/${resource}/${id}`, { method: 'DELETE' });
export const login = (body) => api('/auth/login', { method: 'POST', body: JSON.stringify(body) });
export const clientRegister = (body) => api('/auth/register-client', { method: 'POST', body: JSON.stringify(body) });
export const details = (path) => api(`/details${path}`);
export const options = (field, dependsValue = '') => api(`/options/${field}${dependsValue ? `?dependsValue=${encodeURIComponent(dependsValue)}` : ''}`);
