// userPages.js
// All pages shown to normal users: landing, signup, login, dashboard,
// entity details, component details + feedback form, my feedback.

import {
  getCurrentUser, getEntities, getEntity, getComponentsByEntity, getComponent,
  getFeedbackByComponent, getFeedbackByUser, addFeedback, addRequest,
  entityRating, entityFeedbackCount, averageRating, getUserName,
} from "./storage.js";
import { signup, login } from "./auth.js";

// Small helper: show star characters for a rating (e.g. 4.2 -> "★★★★☆")
function stars(rating) {
  const full = Math.round(rating);
  return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
}

// Category color map — each category gets a subtle accent color
const CATEGORY_COLORS = {
  Education: "#3182ce",
  Hotel: "#d69e2e",
  "Mobile App": "#805ad5",
  Product: "#38a169",
  Healthcare: "#e53e3e",
  Entertainment: "#dd6b20",
  Other: "#7b8794",
};
function categoryColor(cat) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;
}

// ---- LANDING PAGE ----
export function landingPage() {
  return `
  <section class="landing">
    <div class="hero">
      <img src="/prism_logo.png" alt="PRISM logo" class="prism-logo-img" />
      <h1 class="prism-title">PRISM</h1>
      <p class="tagline">Turn opinions into insights.</p>
      <p class="blurb">
        PRISM is a simple feedback management system that collects different opinions,
        organizes them by entity and component, and provides basic insights through
        ratings and feedback summaries.
      </p>
      <div class="landing-actions">
        <button class="btn btn-primary" data-nav="signup">Sign Up</button>
        <button class="btn btn-outline" data-nav="login">Log In</button>
      </div>
    </div>

    <div class="flow">
      <span class="flow-box">Mixed Opinions</span>
      <span class="flow-arrow">→</span>
      <span class="flow-box prism">PRISM</span>
      <span class="flow-arrow">→</span>
      <span class="flow-box">Organized Feedback</span>
      <span class="flow-arrow">→</span>
      <span class="flow-box">Ratings &amp; Insights</span>
    </div>

    <div class="how-it-works">
      <h3>How PRISM Works</h3>
      <div class="steps">
        <div class="step">
          <span class="step-num">01</span>
          <span class="step-title">Share</span>
          <p>Users submit their opinions.</p>
        </div>
        <div class="step">
          <span class="step-num">02</span>
          <span class="step-title">Organize</span>
          <p>PRISM organizes feedback by entity and component.</p>
        </div>
        <div class="step">
          <span class="step-num">03</span>
          <span class="step-title">Analyze</span>
          <p>Ratings and feedback types are summarized.</p>
        </div>
        <div class="step">
          <span class="step-num">04</span>
          <span class="step-title">Understand</span>
          <p>Users and admins see the overall picture.</p>
        </div>
      </div>
    </div>

    <div class="admin-link-block">
      <p class="muted">Administrator?</p>
      <button class="btn btn-outline btn-sm" data-nav="admin-login">Admin Login</button>
    </div>
  </section>
  `;
}

// ---- SIGNUP PAGE ----
export function signupPage() {
  return `
  <section class="card-page">
    <h2>Create your account</h2>
    <form id="signup-form" class="form">
      <label>Name <input type="text" name="name" required /></label>
      <label>Email <input type="email" name="email" required /></label>
      <label>Password <input type="password" name="password" required /></label>
      <button class="btn btn-primary" type="submit">Sign Up</button>
    </form>
    <p id="signup-error" class="error"></p>
    <p class="hint">Already have an account? <a href="#login" data-nav="login">Log in</a>.</p>
  </section>
  `;
}

export function signupPageInit() {
  const form = document.getElementById("signup-form");
  const error = document.getElementById("signup-error");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const result = signup(data.get("name"), data.get("email"), data.get("password"));
    if (result === true) {
      location.hash = "#dashboard";
    } else {
      error.textContent = result;
    }
  });
}

// ---- LOGIN PAGE ----
export function loginPage() {
  return `
  <section class="card-page">
    <h2>Log in</h2>
    <form id="login-form" class="form">
      <label>Email <input type="email" name="email" required /></label>
      <label>Password <input type="password" name="password" required /></label>
      <button class="btn btn-primary" type="submit">Log In</button>
    </form>
    <p id="login-error" class="error"></p>
    <p class="hint">No account? <a href="#signup" data-nav="signup">Sign up</a>.</p>
    <p class="hint">Administrator? <a href="#admin-login" data-nav="admin-login">Admin Login</a></p>
    <p class="hint">Demo user: user@prism.com / user123</p>
  </section>
  `;
}

export function loginPageInit() {
  const form = document.getElementById("login-form");
  const error = document.getElementById("login-error");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const result = login(data.get("email"), data.get("password"));
    if (result === true) {
      const user = getCurrentUser();
      location.hash = user.role === "admin" ? "#admin" : "#dashboard";
    } else {
      error.textContent = result;
    }
  });
}

// ---- USER DASHBOARD ----
export function dashboardPage() {
  const user = getCurrentUser();
  const entities = getEntities();
  const myFeedback = getFeedbackByUser(user.id).slice(-2).reverse();

  const entityCards = entities.map((e) => {
    const rating = entityRating(e.id);
    const count = entityFeedbackCount(e.id);
    return `
      <div class="card entity-card" data-nav="entity" data-id="${e.id}">
        <span class="cat-badge" style="background:${categoryColor(e.category)}">${e.category}</span>
        <h3>${e.name}</h3>
        <p class="muted">${e.description}</p>
        <div class="card-footer">
          <span class="rating">${rating > 0 ? rating.toFixed(1) : "—"} ${rating > 0 ? stars(rating) : ""}</span>
          <span class="muted small">${count} feedback</span>
        </div>
        <span class="view-link">View Details →</span>
      </div>`;
  }).join("");

  const recent = myFeedback.map((f) => {
    const c = getComponent(f.componentId);
    const e = c ? getEntity(c.entityId) : null;
    return `
      <div class="feedback-item">
        <p><strong>${e ? e.name : "?"} → ${c ? c.name : "?"}</strong></p>
        <p>${f.rating}★ <span class="tag tag-${f.type.toLowerCase()}">${f.type}</span></p>
        <p class="muted small">${f.date}</p>
      </div>`;
  }).join("");

  return `
  <section>
    <div class="welcome-banner">
      <h2>Welcome back, ${user.name} 👋</h2>
      <p class="muted">Explore entities and share your experience.</p>
    </div>

    <div class="explore-head">
      <h3>Explore Entities</h3>
      <p class="muted small">Find an organization, product or service and share your experience.</p>
      <input id="entity-search" type="search" placeholder="Search entities..." />
    </div>
    <div class="grid" id="entity-grid">${entityCards}</div>

    <h3 class="section-title">My Recent Feedback</h3>
    ${recent || `<p class="muted">No feedback yet.</p>`}
    <p class="hint"><a href="#my-feedback" data-nav="my-feedback">See all my feedback →</a></p>

    <h3 class="section-title">Quick Actions</h3>
    <div class="quick-actions">
      <button class="btn btn-primary" data-nav="dashboard">Give Feedback</button>
      <button class="btn btn-outline" data-nav="my-feedback">My Feedback</button>
    </div>
  </section>
  `;
}

export function dashboardPageInit() {
  const search = document.getElementById("entity-search");
  const grid = document.getElementById("entity-grid");
  search.addEventListener("input", () => {
    const q = search.value.toLowerCase();
    [...grid.children].forEach((card) => {
      const name = card.querySelector("h3").textContent.toLowerCase();
      card.style.display = name.includes(q) ? "" : "none";
    });
  });
}

// ---- ENTITY DETAILS ----
export function entityPage(entityId) {
  const e = getEntity(entityId);
  if (!e) return `<p class="muted">Entity not found.</p>`;
  const comps = getComponentsByEntity(entityId);
  const rating = entityRating(entityId);
  const totalCount = entityFeedbackCount(entityId);

  const compCards = comps.map((c) => {
    const list = getFeedbackByComponent(c.id);
    const avg = averageRating(list);
    return `
      <div class="card comp-card">
        <h3>${c.name}</h3>
        <p class="muted small">${c.description}</p>
        <p class="rating">${avg > 0 ? avg.toFixed(1) : "—"} ${avg > 0 ? stars(avg) : ""}</p>
        <p class="muted small">${list.length} feedback</p>
        <div class="comp-actions">
          <button class="btn btn-sm btn-outline" data-nav="component" data-id="${c.id}">View Feedback</button>
          <button class="btn btn-sm btn-primary" data-nav="component" data-id="${c.id}">Give Feedback</button>
        </div>
      </div>`;
  }).join("");

  return `
  <section>
    <a href="#dashboard" data-nav="dashboard" class="back">← Back to dashboard</a>
    <div class="entity-head">
      <span class="cat-badge" style="background:${categoryColor(e.category)}">${e.category}</span>
      <h2>${e.name}</h2>
      <p class="muted">${e.description}</p>
      <div class="entity-stats">
        <div class="entity-stat">
          <span class="stat-num">${rating > 0 ? rating.toFixed(1) : "—"}</span>
          <span class="stat-label">Overall Rating ${rating > 0 ? stars(rating) : ""}</span>
        </div>
        <div class="entity-stat">
          <span class="stat-num">${totalCount}</span>
          <span class="stat-label">Total Feedback</span>
        </div>
      </div>
    </div>
    <h3 class="section-title">Components</h3>
    <div class="grid">${compCards || `<p class="muted">No components yet.</p>`}</div>
    <div class="suggest-section">
      <h3 class="section-title">Suggest a Component</h3>
      <p class="muted small">Notice a missing component? Suggest it and an admin will review it.</p>
      <button class="btn btn-outline" id="suggest-btn">Suggest a Component</button>
      <div id="suggest-area"></div>
    </div>
  </section>
  `;
}

export function entityPageInit(entityId) {
  const btn = document.getElementById("suggest-btn");
  const area = document.getElementById("suggest-area");
  btn.addEventListener("click", () => {
    area.innerHTML = `
      <form id="suggest-form" class="form">
        <label>Component name <input type="text" name="name" placeholder="e.g. Transportation" required /></label>
        <label>Description <input type="text" name="description" placeholder="Short description (optional)" /></label>
        <button class="btn btn-primary" type="submit">Submit Suggestion</button>
      </form>
      <p id="suggest-msg" class="hint"></p>`;
    const form = document.getElementById("suggest-form");
    const msg = document.getElementById("suggest-msg");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = data.get("name");
      addRequest(entityId, getCurrentUser().id, name);
      msg.textContent = "Your component suggestion has been sent to the administrator.";
      form.reset();
    });
  });
}

// ---- COMPONENT DETAILS + FEEDBACK FORM ----
export function componentPage(componentId) {
  const c = getComponent(componentId);
  if (!c) return `<p class="muted">Component not found.</p>`;
  const e = getEntity(c.entityId);
  const list = getFeedbackByComponent(componentId);
  const avg = averageRating(list);

  const items = list.slice().reverse().map((f) => {
    const userName = getUserName(f.userId);
    return `
      <div class="feedback-item">
        <p class="feedback-stars">${stars(f.rating)}</p>
        <p class="feedback-comment">"${f.comment}"</p>
        <p class="feedback-meta">
          <span class="tag tag-${f.type.toLowerCase()}">${f.type}</span>
          <span class="muted small">${userName}</span>
          <span class="muted small">${f.date}</span>
        </p>
      </div>`;
  }).join("");

  return `
  <section>
    <a href="#entity/${c.entityId}" data-nav="entity" data-id="${c.entityId}" class="back">← Back to ${e ? e.name : "entity"}</a>
    <div class="entity-head">
      <p class="muted small breadcrumb">${e ? e.name : ""}</p>
      <h2>${c.name}</h2>
      <p class="muted">${c.description}</p>
      <div class="entity-stats">
        <div class="entity-stat">
          <span class="stat-num">${avg > 0 ? avg.toFixed(1) : "—"}</span>
          <span class="stat-label">Average Rating ${avg > 0 ? stars(avg) : ""}</span>
        </div>
        <div class="entity-stat">
          <span class="stat-num">${list.length}</span>
          <span class="stat-label">Feedback Entries</span>
        </div>
      </div>
    </div>

    <h3 class="section-title">Give Feedback</h3>
    <form id="feedback-form" class="form">
      <label>Rating
        <div class="star-picker" id="star-picker">
          ${[1,2,3,4,5].map((n) => `<span class="star-btn" data-val="${n}">★</span>`).join("")}
          <input type="hidden" name="rating" id="rating-input" required />
        </div>
      </label>
      <label>Feedback Type
        <select name="type" required>
          <option value="">Select...</option>
          <option value="Review">Review</option>
          <option value="Complaint">Complaint</option>
          <option value="Suggestion">Suggestion</option>
          <option value="Appreciation">Appreciation</option>
        </select>
      </label>
      <label>Comment <textarea name="comment" rows="3" placeholder="Write your feedback..." required></textarea></label>
      <button class="btn btn-primary" type="submit">Submit Feedback</button>
    </form>
    <p id="feedback-msg" class="success-msg"></p>

    <h3 class="section-title">Existing Feedback</h3>
    ${items || `<p class="muted">No feedback yet. Be the first!</p>`}
  </section>
  `;
}

export function componentPageInit(componentId) {
  // Star picker logic
  const starBtns = document.querySelectorAll(".star-btn");
  const ratingInput = document.getElementById("rating-input");
  let selectedRating = 0;

  starBtns.forEach((btn) => {
    const val = Number(btn.dataset.val);
    // Hover: highlight stars up to this one
    btn.addEventListener("mouseenter", () => {
      starBtns.forEach((b) => {
        b.classList.toggle("active", Number(b.dataset.val) <= val);
      });
    });
    // Click: set the rating
    btn.addEventListener("click", () => {
      selectedRating = val;
      ratingInput.value = val;
      starBtns.forEach((b) => {
        b.classList.toggle("selected", Number(b.dataset.val) <= val);
      });
    });
  });
  // Reset hover when leaving the picker
  document.getElementById("star-picker").addEventListener("mouseleave", () => {
    starBtns.forEach((b) => {
      b.classList.toggle("active", Number(b.dataset.val) <= selectedRating);
      b.classList.toggle("selected", Number(b.dataset.val) <= selectedRating);
    });
  });

  // Form submit
  const form = document.getElementById("feedback-form");
  const msg = document.getElementById("feedback-msg");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    if (!data.get("rating")) {
      msg.textContent = "Please select a rating.";
      msg.className = "error";
      return;
    }
    addFeedback(
      getCurrentUser().id,
      componentId,
      Number(data.get("rating")),
      data.get("type"),
      data.get("comment")
    );
    msg.textContent = "Feedback submitted successfully.";
    msg.className = "success-msg";
    form.reset();
    selectedRating = 0;
    starBtns.forEach((b) => { b.classList.remove("active", "selected"); });
    // Refresh after a short delay so the new feedback appears
    setTimeout(() => location.reload(), 800);
  });
}

// ---- MY FEEDBACK ----
export function myFeedbackPage() {
  const user = getCurrentUser();
  const list = getFeedbackByUser(user.id).slice().reverse();
  const items = list.map((f) => {
    const c = getComponent(f.componentId);
    const e = c ? getEntity(c.entityId) : null;
    return `
      <div class="feedback-item">
        <p><strong>${e ? e.name : "?"} → ${c ? c.name : "?"}</strong></p>
        <p class="feedback-stars">${stars(f.rating)}</p>
        <p class="feedback-comment">"${f.comment}"</p>
        <p class="feedback-meta">
          <span class="tag tag-${f.type.toLowerCase()}">${f.type}</span>
          <span class="muted small">${f.date}</span>
        </p>
      </div>`;
  }).join("");

  return `
  <section>
    <a href="#dashboard" data-nav="dashboard" class="back">← Back to dashboard</a>
    <h2>My Feedback</h2>
    ${items || `<p class="muted">You have not submitted any feedback yet.</p>`}
  </section>
  `;
}
