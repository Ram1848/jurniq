import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1C1C1E',
            color: '#F5F5F7',
            borderRadius: '12px',
            padding: '14px 20px',
            fontSize: '0.9rem',
            fontFamily: "'Inter', sans-serif",
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          },
          success: {
            iconTheme: { primary: '#30D158', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#FF453A', secondary: '#fff' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
