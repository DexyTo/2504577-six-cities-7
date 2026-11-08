import axios from 'axios';
import { getToken } from './token';

const BASE_URL = 'https://14.design.htmlacademy.pro/six-cities';
const REQUEST_TIMEOUT = 5000;

export function createApi() {
  const api = axios.create({
    baseURL: BASE_URL,
    timeout: REQUEST_TIMEOUT,
  });

  api.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
      config.headers.set('X-Token', token);
    }

    return config;
  });

  return api;
}
