import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { migrateOldData } from './store/migrate';
import './styles/index.css';

// Run one-time data migration from old localStorage to new Zustand stores
migrateOldData();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
