import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import { store } from './state/store';
import './index.css';

const startApp = () => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>
  );
};

const startCordovaApp = () => {
  window.plugins.OneSignal.setAppId('31624c1f-53a1-475e-9ac0-c842a4d9a2d8');
  window.plugins.OneSignal.setNotificationOpenedHandler(function (jsonData) {
    console.log(`notificationOpenedCallback: ${JSON.stringify(jsonData)}`);
  });

  // Prompts the user for notification permissions.
  //    * Since this shows a generic native prompt,
  //  we recommend instead using an In-App Message to prompt for notification permission (See step 6) to better communicate to your users what notifications they will get.
  window.plugins.OneSignal.promptForPushNotificationsWithUserResponse(function (accepted) {
    console.log(`User accepted notifications: ${accepted}`);
  });
  startApp();
};

if (window.cordova) {
  document.addEventListener('deviceready', startCordovaApp, false);
} else {
  startApp();
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
