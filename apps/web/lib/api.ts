// 📁 apps/web/lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // <-- INI YANG PALING PENTING!
});

export default api;