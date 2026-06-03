import { renderLogin } from './views/login.js';
import { renderDashboard } from './views/dashboard.js';

export const navigateTo = (viewName) => {
  localStorage.setItem('currentView', viewName);
  router();
};

export const router = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  let view = localStorage.getItem('currentView') || 'login';

  // Navigation Route Guards Protection
  if (!user) {
    view = 'login';
  } else if (view === 'login') {
    view = 'dashboard';
  }

  const appContainer = document.getElementById('app');
  appContainer.innerHTML = ''; 

  if (view === 'login') {
    renderLogin(appContainer);
  } else if (view === 'dashboard') {
    renderDashboard(appContainer, user);
  }
};
