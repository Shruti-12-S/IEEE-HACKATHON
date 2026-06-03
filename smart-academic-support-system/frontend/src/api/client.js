const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("sass_token");

export const api = async (path, options = {}) => {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};
