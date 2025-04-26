// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Auth0Provider } from '@auth0/auth0-react';

const domain = "dev-d4td7btg2a4q84ew.us.auth0.com";
const clientId = "hoo0TNRdBGia9DSdDfYcZjPXVqZar7pm"; // Replace with your actual client ID

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    authorizationParams={{
      redirect_uri: window.location.origin,
      // If you do NOT need an access token for a custom API, do not include the audience.
      // audience: "YOUR_API_IDENTIFIER", 
    }}
    cacheLocation="localstorage"  // Optional, but can help maintain state on refresh.
  >
    <App />
  </Auth0Provider>
);