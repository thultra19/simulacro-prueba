import { API } from '../api.js';
import { navigateTo } from '../router.js';

export const renderDashboard = async (container, user) => {
  container.innerHTML = `
    <nav class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
      <div>
        <h1 class="text-xl font-bold text-gray-900 tracking-tight">Project Engine</h1>
        <p class="text-xs text-gray-500">Identity: <span class="font-semibold text-indigo-600">${user.name}</span> • Role: <span class="uppercase font-bold text-xs">${user.role}</span></p>
      </div>
      <button id="logout-btn" class="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition duration-200">Logout</button>
    </nav>
    
    <main class="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
      <div id="metrics-grid" class="grid grid-cols-1 sm:grid-cols-3 gap-4"></div>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div class="flex flex-1 gap-2">
          <input type="text" id="search-input" placeholder="Search projects..." class="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full max-w-xs">
          <select id="filter-status" class="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        ${user.role === 'manager' ? '<button id="open-create-modal" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition">+ Create Project</button>' : ''}
      </div>

      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3.5 text-left font-semibold text-gray-600 uppercase tracking-wider">Project Name</th>
                <th class="px-6 py-3.5 text-left font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th class="px-6 py-3.5 text-left font-semibold text-gray-600 uppercase tracking-wider">Assigned Owner</th>
                <th class="px-6 py-3.5 text-left font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3.5 text-right font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody id="projects-table-body" class="divide-y divide-gray-200 bg-white"></tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Project Data Modal Form Context -->
    <div id="project-modal" class="hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 transform transition-all">
        <h3 id="modal-title" class="text-xl font-bold text-gray-900 mb-4">Create Project</h3>
        <form id="project-form" class="space-y-4">
          <input type="hidden" id="project-id">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input type="text" id="proj-name" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="proj-desc" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 rows="3"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Assigned Collaborator</label>
            <select id="proj-assigned" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"></select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
            <select id="proj-status" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" id="close-modal" class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition text-sm font-medium">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold shadow-sm">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const logoutBtn = document.getElementById('logout-btn');
  const metricsGrid = document.getElementById('metrics-grid');
  const tableBody = document.getElementById('projects-table-body');
  const searchInput = document.getElementById('search-input');
  const filterStatus = document.getElementById('filter-status');
  const modal = document.getElementById('project-modal');
  const modalTitle = document.getElementById('modal-title');
  const projectForm = document.getElementById('project-form');
  const closeModalBtn = document.getElementById('close-modal');
  const openCreateModalBtn = document.getElementById('open-create-modal');

  let allProjects = [];
  let allUsers = [];

  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    navigateTo('login');
  });

  const loadData = async () => {
    try {
      allUsers = await API.getUsers();
      const rawProjects = await API.getProjects();
      
      // Role scope segregation constraint filter
      allProjects = user.role === 'manager' 
        ? rawProjects 
        : rawProjects.filter(p => String(p.assignedTo) === String(user.id));
      
      populateCollaboratorDropdown();
      renderMetrics();
      renderTable();
    } catch (err) {
      console.error('Data loading error:', err);
    }
  };

  const populateCollaboratorDropdown = () => {
    const dropdown = document.getElementById('proj-assigned');
    if (!dropdown) return;
    const collaborators = allUsers.filter(u => u.role === 'collaborator');
    dropdown.innerHTML = collaborators.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  };

  const renderMetrics = () => {
    if (user.role === 'manager') {
      const total = allProjects.length;
      const active = allProjects.filter(p => p.status === 'In Progress').length;
      const finished = allProjects.filter(p => p.status === 'Completed').length;

      metricsGrid.innerHTML = `
        <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Projects</p>
          <p class="text-3xl font-extrabold text-gray-900 mt-1">${total}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">In Progress</p>
          <p class="text-3xl font-extrabold text-blue-600 mt-1">${active}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed Docs</p>
          <p class="text-3xl font-extrabold text-green-600 mt-1">${finished}</p>
        </div>
      `;
    } else {
      metricsGrid.innerHTML = `
        <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm col-span-3 flex justify-between items-center">
          <div>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Assigned Scope</p>
            <p class="text-3xl font-extrabold text-indigo-600 mt-1">${allProjects.length} Projects</p>
          </div>
          <span class="bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-bold rounded-full">Collaborator Board</span>
        </div>
      `;
    }
  };

  const renderTable = () => {
    const query = searchInput.value.toLowerCase();
    const statusVal = filterStatus.value;

    const filtered = allProjects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
      const matchesStatus = statusVal === 'All' || p.status === statusVal;
      return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-gray-400 font-medium">No system entries correspond to query parameters.</td></tr>`;
      return;
    }

    tableBody.innerHTML = filtered.map(p => {
      const assignee = allUsers.find(u => String(u.id) === String(p.assignedTo));
      const assigneeName = assignee ? assignee.name : 'Unassigned';

      let badgeColor = "bg-gray-100 text-gray-700";
      if (p.status === 'In Progress') badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
      if (p.status === 'Completed') badgeColor = "bg-green-50 text-green-700 border-green-200";

      let actionPayload = '';
      if (user.role === 'manager') {
        actionPayload = `
          <button data-id="${p.id}" class="edit-btn text-indigo-600 hover:text-indigo-900 font-semibold mr-3 transition">Edit</button>
          <button data-id="${p.id}" class="delete-btn text-red-600 hover:text-red-900 font-semibold transition">Delete</button>
        `;
      } else {
        actionPayload = `
          <select data-id="${p.id}" class="status-change-select text-xs border border-gray-300 rounded-xl px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="Pending" ${p.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="In Progress" ${p.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Completed" ${p.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        `;
      }

      return `
        <tr class="hover:bg-gray-50/70 transition">
          <td class="px-6 py-4 font-bold text-gray-900">${p.name}</td>
          <td class="px-6 py-4 text-gray-500 max-w-xs truncate">${p.description}</td>
          <td class="px-6 py-4 text-gray-600 font-medium">${assigneeName}</td>
          <td class="px-6 py-4">
            <span class="px-2.5 py-0.5 inline-flex text-xs font-bold rounded-full border ${badgeColor}">
              ${p.status}
            </span>
          </td>
          <td class="px-6 py-4 text-right space-x-1">${actionPayload}</td>
        </tr>
      `;
    }).join('');

    attachTableEventListeners();
  };

  const attachTableEventListeners = () => {
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const proj = allProjects.find(p => String(p.id) === String(id));
        if (proj) {
          modalTitle.textContent = 'Edit Project Metadata';
          document.getElementById('project-id').value = proj.id;
          document.getElementById('proj-name').value = proj.name;
          document.getElementById('proj-desc').value = proj.description;
          document.getElementById('proj-assigned').value = proj.assignedTo;
          document.getElementById('proj-status').value = proj.status;
          modal.classList.remove('hidden');
        }
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (confirm('Confirm standard destruction tracking for selected internal project?')) {
          const id = e.target.getAttribute('data-id');
          await API.deleteProject(id);
          await loadData();
        }
      });
    });

    document.querySelectorAll('.status-change-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        const id = e.target.getAttribute('data-id');
        const newStatus = e.target.value;
        await API.updateProject(id, { status: newStatus });
        await loadData();
      });
    });
  };

  searchInput.addEventListener('input', renderTable);
  filterStatus.addEventListener('change', renderTable);

  if (openCreateModalBtn) {
    openCreateModalBtn.addEventListener('click', () => {
      modalTitle.textContent = 'Create Corporate Project';
      projectForm.reset();
      document.getElementById('project-id').value = '';
      modal.classList.remove('hidden');
    });
  }

  closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

  projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('project-id').value;
    const payload = {
      name: document.getElementById('proj-name').value.trim(),
      description: document.getElementById('proj-desc').value.trim(),
      assignedTo: parseInt(document.getElementById('proj-assigned').value),
      status: document.getElementById('proj-status').value
    };

    if (id) {
      await API.updateProject(id, payload);
    } else {
      await API.createProject(payload);
    }

    modal.classList.add('hidden');
    await loadData();
  });

  await loadData();
};
