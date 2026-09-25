// adminPages.js
// All admin pages: admin login, dashboard, manage entities/components,
// view feedback, and handle component suggestions.

import {
  getCurrentUser, getEntities, getEntity, addEntity, updateEntity, deleteEntity,
  getComponents, getComponentsByEntity, getComponent, addComponent, updateComponent, deleteComponent,
  getFeedback, getRequests, updateRequestStatus, getUserName,
  averageRating, entityRating, entityFeedbackCount,
} from "./storage.js";
import { login } from "./auth.js";

// ---- ADMIN LOGIN ----
export function adminLoginPage() {
  return `
  <section class="card-page admin-login-card">
    <div class="admin-badge">Administrator Login</div>
    <form id="admin-login-form" class="form">
      <label>Email <input type="email" name="email" required /></label>
      <label>Password <input type="password" name="password" required /></label>
      <button class="btn btn-primary" type="submit">Log In</button>
    </form>
    <p id="admin-login-error" class="error"></p>
    <p class="hint">Demo admin: admin@prism.com / admin123</p>
    <p class="hint"><a href="#login" data-nav="login">User login →</a></p>
  </section>
  `;
}

export function adminLoginPageInit() {
  const form = document.getElementById("admin-login-form");
  const error = document.getElementById("admin-login-error");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const result = login(data.get("email"), data.get("password"));
    if (result === true) {
      if (getCurrentUser().role === "admin") {
        location.hash = "#admin";
      } else {
        error.textContent = "This account is not an admin.";
      }
    } else {
      error.textContent = result;
    }
  });
}

// ---- ADMIN DASHBOARD ----
export function adminDashboardPage() {
  const entities = getEntities();
  const components = getComponents();
  const feedback = getFeedback();
  const pending = getRequests().filter((r) => r.status === "Pending");

  // Overall average rating across all feedback
  const overall = averageRating(feedback);

  // Feedback type counts across all feedback
  const typeCounts = { Review: 0, Complaint: 0, Suggestion: 0, Appreciation: 0 };
  feedback.forEach((f) => { if (typeCounts[f.type] !== undefined) typeCounts[f.type]++; });
  const maxCount = Math.max(1, ...Object.values(typeCounts));

  // Component ratings list
  const compRows = components.map((c) => {
    const list = feedback.filter((f) => f.componentId === c.id);
    const e = getEntity(c.entityId);
    const avg = averageRating(list);
    return `<tr><td>${e ? e.name : "?"}</td><td>${c.name}</td><td>${avg > 0 ? avg.toFixed(1) : "—"}</td><td>${list.length}</td></tr>`;
  }).join("");

  // Recent feedback (last 5)
  const recent = feedback.slice(-5).reverse().map((f) => {
    const c = getComponent(f.componentId);
    const e = c ? getEntity(c.entityId) : null;
    const userName = getUserName(f.userId);
    return `<li>${e ? e.name : "?"} → ${c ? c.name : "?"} — ${f.rating}★ (${f.type}) — ${userName} — ${f.date}</li>`;
  }).join("");

  // Pending requests
  const pendingRows = pending.map((r) => {
    const e = getEntity(r.entityId);
    return `
      <div class="pending-item">
        <div>
          <strong>${r.name}</strong>
          <span class="muted small">for ${e ? e.name : "?"} — ${r.date}</span>
        </div>
        <div>
          <button class="btn btn-sm btn-primary" data-approve-dash="${r.id}">Approve</button>
          <button class="btn btn-sm btn-danger" data-reject-dash="${r.id}">Reject</button>
        </div>
      </div>`;
  }).join("");

  return `
  <section id="admin-dashboard-page">
    <h2>Admin Dashboard</h2>
    <div class="stat-row">
      <div class="stat"><span class="stat-num">${entities.length}</span><span class="stat-label">Total Entities</span></div>
      <div class="stat"><span class="stat-num">${components.length}</span><span class="stat-label">Total Components</span></div>
      <div class="stat"><span class="stat-num">${feedback.length}</span><span class="stat-label">Total Feedback</span></div>
      <div class="stat"><span class="stat-num">${pending.length}</span><span class="stat-label">Pending Requests</span></div>
    </div>

    <div class="stat-row">
      <div class="stat wide"><span class="stat-num">${overall > 0 ? overall.toFixed(1) : "—"}</span><span class="stat-label">Overall Average Rating</span></div>
    </div>

    <h3 class="section-title">Feedback Types</h3>
    <div class="bars">
      ${Object.entries(typeCounts).map(([type, count]) => `
        <div class="bar-row">
          <span class="bar-label">${type}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${(count / maxCount) * 100}%"></div></div>
          <span class="bar-count">${count}</span>
        </div>`).join("")}
    </div>

    <h3 class="section-title">Component Ratings</h3>
    <table class="data-table">
      <thead><tr><th>Entity</th><th>Component</th><th>Average</th><th>Count</th></tr></thead>
      <tbody>${compRows || `<tr><td colspan="4">No data</td></tr>`}</tbody>
    </table>

    <h3 class="section-title">Recent Feedback</h3>
    ${recent ? `<ul class="recent-list">${recent}</ul>` : `<p class="muted">No feedback yet.</p>`}

    <h3 class="section-title">Pending Component Requests</h3>
    ${pendingRows || `<p class="muted">No pending requests.</p>`}
  </section>
  `;
}

export function adminDashboardPageInit() {
  const page = document.getElementById("admin-dashboard-page");
  if (!page) return;
  page.addEventListener("click", (e) => {
    const approveId = e.target.getAttribute("data-approve-dash");
    const rejectId = e.target.getAttribute("data-reject-dash");
    if (approveId) {
      const req = getRequests().find((r) => r.id === approveId);
      if (req) {
        addComponent(req.entityId, req.name, "Added from user suggestion.");
        updateRequestStatus(approveId, "Approved");
        location.reload();
      }
    }
    if (rejectId) {
      updateRequestStatus(rejectId, "Rejected");
      location.reload();
    }
  });
}

// ---- MANAGE ENTITIES & COMPONENTS ----
export function adminManagePage() {
  const entities = getEntities();

  const entityRows = entities.map((e) => {
    const compCount = getComponentsByEntity(e.id).length;
    return `
      <tr>
        <td>${e.name}</td>
        <td><span class="cat-badge-sm" style="background:${categoryColorAdmin(e.category)}">${e.category}</span></td>
        <td>${e.description}</td>
        <td>${compCount}</td>
        <td>
          <button class="btn btn-sm" data-edit-entity="${e.id}">Edit</button>
          <button class="btn btn-sm btn-danger" data-delete-entity="${e.id}">Delete</button>
        </td>
      </tr>`;
  }).join("");

  const componentRows = getComponents().map((c) => {
    const e = getEntity(c.entityId);
    return `
      <tr>
        <td>${e ? e.name : "?"}</td>
        <td>${c.name}</td>
        <td>${c.description}</td>
        <td>
          <button class="btn btn-sm" data-edit-component="${c.id}">Edit</button>
          <button class="btn btn-sm btn-danger" data-delete-component="${c.id}">Delete</button>
        </td>
      </tr>`;
  }).join("");

  const entityOptions = entities
    .map((e) => `<option value="${e.id}">${e.name}</option>`)
    .join("");

  const categoryOptions = ["Education", "Hotel", "Mobile App", "Product", "Healthcare", "Entertainment", "Other"]
    .map((c) => `<option value="${c}">${c}</option>`)
    .join("");

  return `
  <section id="manage-page">
    <h2>Manage Entities &amp; Components</h2>

    <h3 class="section-title">Add Entity</h3>
    <form id="add-entity-form" class="form">
      <label>Name <input type="text" name="name" placeholder="Entity name" required /></label>
      <label>Category
        <select name="category">${categoryOptions}</select>
      </label>
      <label>Description <input type="text" name="description" placeholder="Short description" /></label>
      <button class="btn btn-primary" type="submit">Add Entity</button>
    </form>
    <p id="entity-msg" class="hint"></p>

    <table class="data-table">
      <thead><tr><th>Name</th><th>Category</th><th>Description</th><th>Components</th><th>Actions</th></tr></thead>
      <tbody>${entityRows || `<tr><td colspan="5">No entities</td></tr>`}</tbody>
    </table>

    <h3 class="section-title">Add Component</h3>
    <form id="add-component-form" class="form">
      <label>Entity
        <select name="entityId" required>${entityOptions || `<option value="">No entities</option>`}</select>
      </label>
      <label>Component Name <input type="text" name="name" required /></label>
      <label>Description <input type="text" name="description" /></label>
      <button class="btn btn-primary" type="submit">Add Component</button>
    </form>
    <p id="component-msg" class="hint"></p>

    <table class="data-table">
      <thead><tr><th>Entity</th><th>Component</th><th>Description</th><th>Actions</th></tr></thead>
      <tbody>${componentRows || `<tr><td colspan="4">No components</td></tr>`}</tbody>
    </table>

    <div id="edit-modal" class="modal hidden">
      <div class="modal-content">
        <h3 id="edit-title">Edit</h3>
        <form id="edit-form" class="form"></form>
        <button class="btn btn-outline" id="edit-cancel">Cancel</button>
      </div>
    </div>
  </section>
  `;
}

// Category color map (same as userPages, duplicated to keep files independent)
const CATEGORY_COLORS_ADMIN = {
  Education: "#3182ce",
  Hotel: "#d69e2e",
  "Mobile App": "#805ad5",
  Product: "#38a169",
  Healthcare: "#e53e3e",
  Entertainment: "#dd6b20",
  Other: "#7b8794",
};
function categoryColorAdmin(cat) {
  return CATEGORY_COLORS_ADMIN[cat] || CATEGORY_COLORS_ADMIN.Other;
}

export function adminManagePageInit() {
  // Add entity
  const entityForm = document.getElementById("add-entity-form");
  const entityMsg = document.getElementById("entity-msg");
  entityForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(entityForm);
    addEntity(d.get("name"), d.get("description"), d.get("category"));
    entityMsg.textContent = "Entity added.";
    entityForm.reset();
    setTimeout(() => location.reload(), 500);
  });

  // Add component
  const compForm = document.getElementById("add-component-form");
  const compMsg = document.getElementById("component-msg");
  compForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(compForm);
    if (!d.get("entityId")) { compMsg.textContent = "Add an entity first."; return; }
    addComponent(d.get("entityId"), d.get("name"), d.get("description"));
    compMsg.textContent = "Component added.";
    compForm.reset();
    setTimeout(() => location.reload(), 500);
  });

  // Edit / delete buttons (using event delegation on the page container)
  document.getElementById("manage-page").addEventListener("click", handleManageClick);
}

function handleManageClick(e) {
  const target = e.target;
  const editEntity = target.getAttribute("data-edit-entity");
  const deleteEntity = target.getAttribute("data-delete-entity");
  const editComp = target.getAttribute("data-edit-component");
  const deleteComp = target.getAttribute("data-delete-component");

  if (editEntity) openEditModal("entity", editEntity);
  if (editComp) openEditModal("component", editComp);

  if (deleteEntity) {
    if (confirm("Delete this entity? Its components and feedback will also be removed.")) {
      deleteEntity(deleteEntity);
      location.reload();
    }
  }
  if (deleteComp) {
    if (confirm("Delete this component? Its feedback will also be removed.")) {
      deleteComponent(deleteComp);
      location.reload();
    }
  }
}

function openEditModal(kind, id) {
  const modal = document.getElementById("edit-modal");
  const title = document.getElementById("edit-title");
  const form = document.getElementById("edit-form");

  const categoryOptions = ["Education", "Hotel", "Mobile App", "Product", "Healthcare", "Entertainment", "Other"];

  if (kind === "entity") {
    const e = getEntity(id);
    title.textContent = "Edit Entity";
    const opts = categoryOptions.map((c) =>
      `<option value="${c}" ${e.category === c ? "selected" : ""}>${c}</option>`
    ).join("");
    form.innerHTML = `
      <label>Name <input type="text" name="name" value="${e.name}" required /></label>
      <label>Category <select name="category">${opts}</select></label>
      <label>Description <input type="text" name="description" value="${e.description}" /></label>
      <button class="btn btn-primary" type="submit">Save</button>`;
    form.onsubmit = (ev) => {
      ev.preventDefault();
      const d = new FormData(form);
      updateEntity(id, d.get("name"), d.get("description"), d.get("category"));
      location.reload();
    };
  } else {
    const c = getComponent(id);
    title.textContent = "Edit Component";
    form.innerHTML = `
      <label>Name <input type="text" name="name" value="${c.name}" required /></label>
      <label>Description <input type="text" name="description" value="${c.description}" /></label>
      <button class="btn btn-primary" type="submit">Save</button>`;
    form.onsubmit = (ev) => {
      ev.preventDefault();
      const d = new FormData(form);
      updateComponent(id, d.get("name"), d.get("description"));
      location.reload();
    };
  }
  modal.classList.remove("hidden");
  document.getElementById("edit-cancel").onclick = () => modal.classList.add("hidden");
}

// ---- ADMIN FEEDBACK VIEWER ----
export function adminFeedbackPage() {
  const feedback = getFeedback().slice().reverse();
  const entities = getEntities();

  const rows = feedback.map((f) => {
    const c = getComponent(f.componentId);
    const e = c ? getEntity(c.entityId) : null;
    const userName = getUserName(f.userId);
    return `
      <tr>
        <td>${e ? e.name : "?"}</td>
        <td>${c ? c.name : "?"}</td>
        <td>${f.rating}★</td>
        <td><span class="tag tag-${f.type.toLowerCase()}">${f.type}</span></td>
        <td>${f.comment}</td>
        <td>${userName}</td>
        <td>${f.date}</td>
      </tr>`;
  }).join("");

  const entityOptions = entities
    .map((e) => `<option value="${e.id}">${e.name}</option>`)
    .join("");

  return `
  <section>
    <h2>All Feedback</h2>
    <div class="filter-row">
      <select id="filter-entity"><option value="">All entities</option>${entityOptions}</select>
      <select id="filter-type">
        <option value="">All types</option>
        <option value="Review">Review</option>
        <option value="Complaint">Complaint</option>
        <option value="Suggestion">Suggestion</option>
        <option value="Appreciation">Appreciation</option>
      </select>
      <input type="search" id="filter-text" placeholder="Search comments..." />
    </div>
    <table class="data-table" id="feedback-table">
      <thead><tr><th>Entity</th><th>Component</th><th>Rating</th><th>Type</th><th>Comment</th><th>User</th><th>Date</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="7">No feedback yet</td></tr>`}</tbody>
    </table>
  </section>
  `;
}

export function adminFeedbackPageInit() {
  const filterEntity = document.getElementById("filter-entity");
  const filterType = document.getElementById("filter-type");
  const filterText = document.getElementById("filter-text");
  const tbody = document.querySelector("#feedback-table tbody");

  function applyFilters() {
    const eId = filterEntity.value;
    const tType = filterType.value;
    const q = filterText.value.toLowerCase();

    // Get all component ids that belong to the chosen entity
    let compIds = null;
    if (eId) compIds = getComponentsByEntity(eId).map((c) => c.id);

    const list = getFeedback().filter((f) => {
      if (compIds && !compIds.includes(f.componentId)) return false;
      if (tType && f.type !== tType) return false;
      if (q && !f.comment.toLowerCase().includes(q)) return false;
      return true;
    }).reverse();

    tbody.innerHTML = list.map((f) => {
      const c = getComponent(f.componentId);
      const e = c ? getEntity(c.entityId) : null;
      const userName = getUserName(f.userId);
      return `<tr><td>${e ? e.name : "?"}</td><td>${c ? c.name : "?"}</td><td>${f.rating}★</td><td><span class="tag tag-${f.type.toLowerCase()}">${f.type}</span></td><td>${f.comment}</td><td>${userName}</td><td>${f.date}</td></tr>`;
    }).join("") || `<tr><td colspan="7">No matching feedback</td></tr>`;
  }

  filterEntity.addEventListener("change", applyFilters);
  filterType.addEventListener("change", applyFilters);
  filterText.addEventListener("input", applyFilters);
}

// ---- ADMIN COMPONENT REQUESTS ----
export function adminRequestsPage() {
  const requests = getRequests().slice().reverse();
  const rows = requests.map((r) => {
    const e = getEntity(r.entityId);
    return `
      <tr>
        <td>${e ? e.name : "?"}</td>
        <td>${r.name}</td>
        <td>${r.date}</td>
        <td><span class="tag tag-${r.status.toLowerCase()}">${r.status}</span></td>
        <td>
          ${r.status === "Pending" ? `
            <button class="btn btn-sm btn-primary" data-approve="${r.id}">Approve</button>
            <button class="btn btn-sm btn-danger" data-reject="${r.id}">Reject</button>
          ` : "—"}
        </td>
      </tr>`;
  }).join("");

  return `
  <section id="requests-page">
    <h2>Component Suggestions</h2>
    <table class="data-table">
      <thead><tr><th>Entity</th><th>Suggested Component</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="5">No suggestions</td></tr>`}</tbody>
    </table>
  </section>
  `;
}

export function adminRequestsPageInit() {
  // Attach to the page container so the listener is removed on navigation
  document.getElementById("requests-page").addEventListener("click", (e) => {
    const approveId = e.target.getAttribute("data-approve");
    const rejectId = e.target.getAttribute("data-reject");
    if (approveId) {
      // Approve: mark as approved and add as a real component
      const req = getRequests().find((r) => r.id === approveId);
      if (req) {
        addComponent(req.entityId, req.name, "Added from user suggestion.");
        updateRequestStatus(approveId, "Approved");
        location.reload();
      }
    }
    if (rejectId) {
      updateRequestStatus(rejectId, "Rejected");
      location.reload();
    }
  });
}
