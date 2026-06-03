import { API } from '../api.js';
import { navigateTo } from '../router.js';

export const renderLogin = (container) => {
  container.innerHTML = `
    <div class="flex-1 flex items-center justify-center p-6 bg-slate-100">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <h2 class="text-3xl font-extrabold text-center text-gray-900 mb-2">Welcome Back</h2>
        <p class="text-sm text-center text-gray-500 mb-6">Enter details to handle internal assets</p>
        
        <div id="login-error" class="hidden mb-4 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-200"></div>
        
        <form id="login-form" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Corporate Email</label>
            <input type="email" id="email" required class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition">
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input type="password" id="password" required class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition">
          </div>
          <button type="submit" class="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200">Sign In</button>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('login-form');
  const errorDiv = document.getElementById('login-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const authenticatedUser = await API.login(email, password);
      if (authenticatedUser) {
        localStorage.setItem('user', JSON.stringify(authenticatedUser));
        navigateTo('dashboard');
      } else {
        errorDiv.textContent = 'Invalid account email or password combination.';
        errorDiv.classList.remove('hidden');
      }
    } catch (err) {
      errorDiv.textContent = 'Failed linking server database API. Ensure json-server is up.';
      errorDiv.classList.remove('hidden');
    }
  });
};
