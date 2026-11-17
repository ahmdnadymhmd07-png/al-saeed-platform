import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// تسجيل ملف Service Worker المباشر للعمل أوفلاين
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('Al-Saeed SW active:', reg.scope))
      .catch((err) => console.error('SW error:', err));
  });
}

createRoot(document.getElementById('root')!).render(<App />);
