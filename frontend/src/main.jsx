import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from './pages/Home.jsx';

// This finds the <div id="root"> in your index.html and renders the Home page inside it
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);