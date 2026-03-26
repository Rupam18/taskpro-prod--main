/* ===================================
   TaskPro — Dashboard JavaScript
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ========== AUTH CHECK ==========
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user) {
    window.location.href = 'login.html';
    return;
  }

  // Update UI with user info
  document.getElementById('userName').textContent = user.name;
  document.getElementById('welcomeName').textContent = user.name.split(' ')[0];
  document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();

  // ========== API UTILS ==========
  const API_BASE = 'http://localhost:5001/api';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // ========== STATE ==========
  let allTasks = [];
  let allProjects = [];
  let selectedProjectId = localStorage.getItem('selectedProjectId') || null;

  // ========== TASK FETCHING & RENDERING ==========
  async function fetchTasks() {
    try {
      let url = `${API_BASE}/tasks`;
      if (selectedProjectId) {
        url += `?projectId=${selectedProjectId}`;
        updateDashboardHeader();
      } else {
        resetDashboardHeader();
      }

      const res = await fetch(url, { headers });
      const data = await res.json();
      if (res.ok) {
        allTasks = data;
        renderTasks();
        updateStats();
      } else {
        showToast(data.message || 'Failed to fetch tasks');
      }
    } catch (err) {
      showToast('Server error. Is the backend running?');
    }
  }

  async function fetchProjects() {
    try {
      const res = await fetch(`${API_BASE}/projects`, { headers });
      const data = await res.json();
      if (res.ok) {
        allProjects = data;
        populateProjectDropdown();
        renderSidebarProjects();
        if (selectedProjectId) updateDashboardHeader();
      }
    } catch (err) {
      console.error('Failed to fetch projects');
    }
  }

  function renderSidebarProjects() {
    const container = document.getElementById('sidebarProjectList');
    if (!container) return;

    container.innerHTML = '';
    
    allProjects.slice(0, 5).forEach(project => {
      const item = document.createElement('a');
      item.href = '#';
      item.className = `nav-item ${project._id === selectedProjectId ? 'active' : ''}`;
      item.style.borderLeft = `3px solid ${project.color || '#6366f1'}`;
      item.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        <span>${project.name}</span>
      `;
      item.onclick = (e) => {
        e.preventDefault();
        selectedProjectId = project._id;
        localStorage.setItem('selectedProjectId', selectedProjectId);
        fetchTasks();
        renderSidebarProjects();
      };
      container.appendChild(item);
    });
  }

  function updateDashboardHeader() {
    const project = allProjects.find(p => p._id === selectedProjectId);
    if (project) {
      document.getElementById('dashboardTitle').textContent = project.name;
      document.getElementById('dashboardSubtitle').textContent = project.description || 'Project details and tasks';
      document.getElementById('clearProjectFilter').classList.remove('hidden');
    }
  }

  function resetDashboardHeader() {
    document.getElementById('dashboardTitle').innerHTML = `Welcome back, <span id="welcomeName">${user.name.split(' ')[0]}</span>`;
    document.getElementById('dashboardSubtitle').textContent = "Here's what's happening with your projects today.";
    document.getElementById('clearProjectFilter').classList.add('hidden');
  }

  // Clear Filter
  document.getElementById('clearProjectFilter').addEventListener('click', () => {
    selectedProjectId = null;
    localStorage.removeItem('selectedProjectId');
    fetchTasks();
    renderSidebarProjects();
  });

  function populateProjectDropdown() {
    const dropdown = document.getElementById('taskProject');
    if (!dropdown) return;
    
    // Keep the "No Project" option
    dropdown.innerHTML = '<option value="">No Project (General)</option>';
    
    allProjects.forEach(project => {
      const option = document.createElement('option');
      option.value = project._id;
      option.textContent = project.name;
      if (project._id === selectedProjectId) option.selected = true;
      dropdown.appendChild(option);
    });
  }

  function renderTasks() {
    const columns = {
      'todo': document.getElementById('todo-cards'),
      'in-progress': document.getElementById('inprogress-cards'),
      'done': document.getElementById('done-cards')
    };

    // Clear columns
    Object.values(columns).forEach(col => col.innerHTML = '');

    allTasks.forEach(task => {
      const card = createTaskCard(task);
      const col = columns[task.status];
      if (col) col.appendChild(card);
    });

    // Update counts
    document.querySelectorAll('.kanban-col').forEach(col => {
      const cardsCol = col.querySelector('.kanban-cards');
      if (!cardsCol) return;
      const status = cardsCol.id.split('-')[0];
      const count = allTasks.filter(t => t.status === (status === 'inprogress' ? 'in-progress' : status)).length;
      const countEl = col.querySelector('.kanban-count');
      if (countEl) countEl.textContent = count;
    });
  }

  function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.draggable = true;
    card.id = `task-${task._id}`;
    card.dataset.id = task._id;

    card.innerHTML = `
      <div class="kanban-card-top">
        <span class="kanban-tag ${getStatusClass(task.status)}">${task.status}</span>
        <button class="delete-task" data-id="${task._id}" title="Delete task">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
      <h4>${task.title}</h4>
      <p>${task.description || ''}</p>
      <div class="kanban-card-footer">
        <div class="kanban-meta">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
          ${new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </div>
    `;

    // Drag events
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', task._id);
      card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });

    // Delete event
    card.querySelector('.delete-task').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task._id);
    });

    return card;
  }

  function getStatusClass(status) {
    if (status === 'todo') return 'purple';
    if (status === 'in-progress') return 'cyan';
    return 'green';
  }

  function updateStats() {
    const total = allTasks.length;
    const inProgress = allTasks.filter(t => t.status === 'in-progress').length;
    const done = allTasks.filter(t => t.status === 'done').length;

    const stats = {
      'Total Tasks': total,
      'In Progress': inProgress,
      'Completed': done
    };

    document.querySelectorAll('.stat-card').forEach(card => {
      const label = card.querySelector('.stat-label').textContent;
      if (stats[label] !== undefined) {
        card.querySelector('.stat-value').dataset.target = stats[label];
      }
    });

    animateCounters();
  }

  // ========== TASK OPERATIONS ==========
  async function createTask(e) {
    e.preventDefault();
    const btn = document.getElementById('saveTaskBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const newTask = {
      title: document.getElementById('taskTitle').value,
      description: document.getElementById('taskDesc').value,
      status: document.getElementById('taskStatus').value,
      projectId: document.getElementById('taskProject').value || undefined
    };

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newTask)
      });
      const data = await res.json();
      if (res.ok) {
        // If we are filtered by a different project, don't show the new task
        if (!selectedProjectId || data.projectId === selectedProjectId) {
            allTasks.push(data);
            renderTasks();
            updateStats();
        }
        closeModal();
        showToast('Task created successfully');
      } else {
        showToast(data.message || 'Failed to create task');
      }
    } catch (err) {
      showToast('Error creating task');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save Task';
    }
  }

  async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        allTasks = allTasks.filter(t => t._id !== id);
        renderTasks();
        updateStats();
        showToast('Task deleted');
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to delete task');
      }
    } catch (err) {
      showToast('Error deleting task');
    }
  }

  async function updateTaskStatus(id, newStatus) {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        const index = allTasks.findIndex(t => t._id === id);
        allTasks[index] = data;
        renderTasks();
        updateStats();
        showToast(`Task moved to ${newStatus}`);
      } else {
        showToast(data.message || 'Failed to update task');
      }
    } catch (err) {
      showToast('Error updating task');
    }
  }

  // ========== DRAG & DROP HANDLERS ==========
  window.allowDrop = (e) => e.preventDefault();
  
  window.drop = (e, status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const task = allTasks.find(t => t._id === id);
    if (task && task.status !== status) {
      updateTaskStatus(id, status);
    }
  };

  // ========== MODAL LOGIC ==========
  const modal = document.getElementById('taskModal');
  const openBtn = document.getElementById('newTaskBtn');
  const closeBtn = document.getElementById('closeModal');
  const taskForm = document.getElementById('taskForm');

  function openModal() { modal.classList.add('active'); }
  function closeModal() { 
    modal.classList.remove('active');
    taskForm.reset();
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  taskForm.addEventListener('submit', createTask);

  window.onclick = (event) => {
    if (event.target === modal) closeModal();
  };

  // ========== SIDEBAR TOGGLE ==========
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');

  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
  });

  if (localStorage.getItem('sidebarCollapsed') === 'true') {
    sidebar.classList.add('collapsed');
  }

  // ========== LOGOUT ==========
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  });

  // ========== TOAST ==========
  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // ========== COUNTER ANIMATION ==========
  function animateCounters() {
    const statValues = document.querySelectorAll('.stat-value[data-target]');
    statValues.forEach(el => {
      const target = parseInt(el.dataset.target);
      const duration = 1200;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });
  }

  // ========== INITIALIZE ==========
  fetchProjects();
  fetchTasks();
});
