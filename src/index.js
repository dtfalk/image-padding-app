import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// just initialize a root
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
