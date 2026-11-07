import axios from 'axios';

const BASE_URL = 'https://14.design.htmlacademy.pro/six-cities';
const REQUEST_TIMEOUT = 5000;
const TOKEN_KEY = 'six-cities-token';

export function createApi() {
  const api = axios.create({
    baseURL: BASE_URL,
    timeout: REQUEST_TIMEOUT,
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.set('X-Token', token);
    }

    return config;
  });

  return api;
}
