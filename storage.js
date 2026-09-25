// storage.js
// This file handles ALL data storage for PRISM.
// We use the browser's Local Storage so data stays after refresh.
// Everything is stored as JSON strings under fixed keys.

// ---- Keys used in Local Storage ----
const KEYS = {
  users: "prism_users",
  entities: "prism_entities",
  components: "prism_components",
  feedback: "prism_feedback",
  componentRequests: "prism_componentRequests",
  currentUser: "prism_currentUser",
};

// ---- Small helper functions ----

// Read an array from Local Storage. If empty, return [].
function getData(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

// Save an array to Local Storage as a JSON string.
function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Make a simple unique id using the current time + a random number.
function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ---- Seed data ----
// This runs once. It adds sample entities, components and feedback
// so the app does not look empty on first open.
function seedData() {
  if (localStorage.getItem(KEYS.entities)) return; // already seeded

  // Admin account (fixed) + demo user
  const users = [
    { id: "admin", name: "Admin", email: "admin@prism.com", password: "admin123", role: "admin" },
    { id: "u1", name: "Demo User", email: "user@prism.com", password: "user123", role: "user" },
    { id: "u2", name: "Asha", email: "asha@prism.com", password: "asha123", role: "user" },
    { id: "u3", name: "Rahul", email: "rahul@prism.com", password: "rahul123", role: "user" },
  ];
  setData(KEYS.users, users);

  // Entities — each now has a category
  const entities = [
    { id: "e1", name: "KL University", description: "A private university in Vijayawada.", category: "Education" },
    { id: "e2", name: "Sunrise Hotel", description: "A 4-star city hotel and restaurant.", category: "Hotel" },
    { id: "e3", name: "QuickPay App", description: "A mobile payments application.", category: "Mobile App" },
    { id: "e4", name: "TechNova Laptop", description: "A 14-inch lightweight laptop for students.", category: "Product" },
    { id: "e5", name: "CityCare Hospital", description: "A multi-speciality city hospital.", category: "Healthcare" },
    { id: "e6", name: "StreamFlix", description: "A video streaming service for movies and shows.", category: "Entertainment" },
  ];
  setData(KEYS.entities, entities);

  // Components belong to entities via entityId
  const components = [
    // KL University
    { id: "c1", entityId: "e1", name: "Teaching", description: "Quality of teaching." },
    { id: "c2", entityId: "e1", name: "Infrastructure", description: "Buildings and labs." },
    { id: "c3", entityId: "e1", name: "Canteens", description: "Food and waiting time." },
    { id: "c4", entityId: "e1", name: "Library", description: "Books and study space." },
    { id: "c5", entityId: "e1", name: "Placements", description: "Job placements support." },
    // Sunrise Hotel
    { id: "c6", entityId: "e2", name: "Rooms", description: "Room cleanliness and comfort." },
    { id: "c7", entityId: "e2", name: "Service", description: "Staff service quality." },
    { id: "c8", entityId: "e2", name: "Food", description: "Restaurant food quality." },
    // QuickPay App
    { id: "c9", entityId: "e3", name: "UI Design", description: "App look and ease of use." },
    { id: "c10", entityId: "e3", name: "Speed", description: "How fast the app works." },
    // TechNova Laptop
    { id: "c11", entityId: "e4", name: "Build Quality", description: "How sturdy the laptop feels." },
    { id: "c12", entityId: "e4", name: "Battery Life", description: "How long the battery lasts." },
    { id: "c13", entityId: "e4", name: "Performance", description: "Speed for daily tasks." },
    // CityCare Hospital
    { id: "c14", entityId: "e5", name: "Doctors", description: "Doctor availability and care." },
    { id: "c15", entityId: "e5", name: "Cleanliness", description: "Hospital hygiene." },
    { id: "c16", entityId: "e5", name: "Billing", description: "Billing transparency and process." },
    // StreamFlix
    { id: "c17", entityId: "e6", name: "Content Library", description: "Variety of movies and shows." },
    { id: "c18", entityId: "e6", name: "Streaming Quality", description: "Video quality and buffering." },
    { id: "c19", entityId: "e6", name: "Pricing", description: "Value for money." },
  ];
  setData(KEYS.components, components);

  // Feedback entries. Each links to a component and a user.
  const feedback = [
    // Teaching (c1)
    { id: "f1", userId: "u1", componentId: "c1", rating: 5, type: "Appreciation", comment: "Teachers explain concepts very clearly.", date: "2026-09-10" },
    { id: "f2", userId: "u2", componentId: "c1", rating: 4, type: "Review", comment: "Faculty members are very supportive.", date: "2026-09-11" },
    { id: "f3", userId: "u3", componentId: "c1", rating: 4, type: "Suggestion", comment: "Teaching is good, but some classes move too quickly.", date: "2026-09-12" },
    // Infrastructure (c2)
    { id: "f4", userId: "u1", componentId: "c2", rating: 3, type: "Complaint", comment: "Some labs need new equipment.", date: "2026-09-11" },
    { id: "f5", userId: "u2", componentId: "c2", rating: 4, type: "Review", comment: "Campus is clean and well maintained.", date: "2026-09-13" },
    // Canteens (c3)
    { id: "f6", userId: "u1", componentId: "c3", rating: 3, type: "Complaint", comment: "Food is okay but waiting time is long.", date: "2026-09-12" },
    { id: "f7", userId: "u3", componentId: "c3", rating: 4, type: "Review", comment: "Affordable and decent variety.", date: "2026-09-14" },
    // Library (c4)
    { id: "f8", userId: "u1", componentId: "c4", rating: 5, type: "Review", comment: "Great collection and quiet study area.", date: "2026-09-13" },
    { id: "f9", userId: "u2", componentId: "c4", rating: 4, type: "Appreciation", comment: "Very helpful librarians.", date: "2026-09-15" },
    // Placements (c5)
    { id: "f10", userId: "u1", componentId: "c5", rating: 4, type: "Review", comment: "Good placement support this year.", date: "2026-09-14" },
    { id: "f11", userId: "u3", componentId: "c5", rating: 5, type: "Appreciation", comment: "Got placed through campus drive.", date: "2026-09-16" },
    // Rooms (c6)
    { id: "f12", userId: "u1", componentId: "c6", rating: 4, type: "Review", comment: "Rooms were clean and comfortable.", date: "2026-09-09" },
    { id: "f13", userId: "u2", componentId: "c6", rating: 3, type: "Complaint", comment: "AC was noisy in the night.", date: "2026-09-10" },
    // Service (c7)
    { id: "f14", userId: "u1", componentId: "c7", rating: 5, type: "Appreciation", comment: "Staff were very polite and quick.", date: "2026-09-09" },
    // Food (c8)
    { id: "f15", userId: "u2", componentId: "c8", rating: 4, type: "Review", comment: "Breakfast spread was excellent.", date: "2026-09-10" },
    // UI Design (c9)
    { id: "f16", userId: "u1", componentId: "c9", rating: 4, type: "Suggestion", comment: "Add a dark mode option.", date: "2026-09-15" },
    { id: "f17", userId: "u3", componentId: "c9", rating: 5, type: "Appreciation", comment: "Clean and simple interface.", date: "2026-09-16" },
    // Speed (c10)
    { id: "f18", userId: "u1", componentId: "c10", rating: 3, type: "Complaint", comment: "App sometimes freezes on startup.", date: "2026-09-15" },
    // Build Quality (c11)
    { id: "f19", userId: "u2", componentId: "c11", rating: 4, type: "Review", comment: "Feels solid for the price.", date: "2026-09-12" },
    // Battery Life (c12)
    { id: "f20", userId: "u3", componentId: "c12", rating: 3, type: "Complaint", comment: "Battery drains fast while gaming.", date: "2026-09-13" },
    // Performance (c13)
    { id: "f21", userId: "u1", componentId: "c13", rating: 4, type: "Review", comment: "Handles daily tasks without lag.", date: "2026-09-14" },
    // Doctors (c14)
    { id: "f22", userId: "u2", componentId: "c14", rating: 5, type: "Appreciation", comment: "Doctors were patient and kind.", date: "2026-09-11" },
    // Cleanliness (c15)
    { id: "f23", userId: "u3", componentId: "c15", rating: 4, type: "Review", comment: "Wards were cleaned regularly.", date: "2026-09-12" },
    // Billing (c16)
    { id: "f24", userId: "u1", componentId: "c16", rating: 3, type: "Suggestion", comment: "Billing process could be simplified.", date: "2026-09-13" },
    // Content Library (c17)
    { id: "f25", userId: "u2", componentId: "c17", rating: 4, type: "Review", comment: "Good mix of movies and originals.", date: "2026-09-14" },
    // Streaming Quality (c18)
    { id: "f26", userId: "u3", componentId: "c18", rating: 5, type: "Appreciation", comment: "No buffering even on mobile data.", date: "2026-09-15" },
    // Pricing (c19)
    { id: "f27", userId: "u1", componentId: "c19", rating: 3, type: "Complaint", comment: "A bit expensive for the basic plan.", date: "2026-09-16" },
  ];
  setData(KEYS.feedback, feedback);

  // One pending component suggestion from the demo user
  const requests = [
    { id: "r1", entityId: "e1", userId: "u1", name: "Transportation", status: "Pending", date: "2026-09-16" },
  ];
  setData(KEYS.componentRequests, requests);
}

// Run seed on load
seedData();

// ---- Public functions used by the rest of the app ----

// Users
function getUsers() { return getData(KEYS.users); }
function saveUsers(u) { setData(KEYS.users, u); }
function findUserByEmail(email) {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}
function addUser(user) {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}
function getUserName(userId) {
  const u = getUsers().find((x) => x.id === userId);
  return u ? u.name : "User";
}

// Current logged-in user
function getCurrentUser() {
  const raw = localStorage.getItem(KEYS.currentUser);
  return raw ? JSON.parse(raw) : null;
}
function setCurrentUser(user) {
  localStorage.setItem(KEYS.currentUser, JSON.stringify(user));
}
function clearCurrentUser() {
  localStorage.removeItem(KEYS.currentUser);
}

// Entities
function getEntities() { return getData(KEYS.entities); }
function saveEntities(e) { setData(KEYS.entities, e); }
function getEntity(id) { return getEntities().find((e) => e.id === id); }
function addEntity(name, description, category) {
  const entities = getEntities();
  entities.push({ id: makeId(), name, description, category: category || "Other" });
  saveEntities(entities);
}
function updateEntity(id, name, description, category) {
  const entities = getEntities();
  const e = entities.find((x) => x.id === id);
  if (e) { e.name = name; e.description = description; e.category = category || e.category; saveEntities(entities); }
}
function deleteEntity(id) {
  // Also delete its components and feedback
  saveEntities(getEntities().filter((e) => e.id !== id));
  const compIds = getComponents().filter((c) => c.entityId === id).map((c) => c.id);
  saveComponents(getComponents().filter((c) => c.entityId !== id));
  saveFeedback(getFeedback().filter((f) => !compIds.includes(f.componentId)));
}

// Components
function getComponents() { return getData(KEYS.components); }
function saveComponents(c) { setData(KEYS.components, c); }
function getComponentsByEntity(entityId) {
  return getComponents().filter((c) => c.entityId === entityId);
}
function getComponent(id) { return getComponents().find((c) => c.id === id); }
function addComponent(entityId, name, description) {
  const components = getComponents();
  components.push({ id: makeId(), entityId, name, description });
  saveComponents(components);
}
function updateComponent(id, name, description) {
  const components = getComponents();
  const c = components.find((x) => x.id === id);
  if (c) { c.name = name; c.description = description; saveComponents(components); }
}
function deleteComponent(id) {
  saveComponents(getComponents().filter((c) => c.id !== id));
  saveFeedback(getFeedback().filter((f) => f.componentId !== id));
}

// Feedback
function getFeedback() { return getData(KEYS.feedback); }
function saveFeedback(f) { setData(KEYS.feedback, f); }
function getFeedbackByComponent(componentId) {
  return getFeedback().filter((f) => f.componentId === componentId);
}
function getFeedbackByUser(userId) {
  return getFeedback().filter((f) => f.userId === userId);
}
function addFeedback(userId, componentId, rating, type, comment) {
  const feedback = getFeedback();
  feedback.push({
    id: makeId(),
    userId,
    componentId,
    rating,
    type,
    comment,
    date: new Date().toISOString().slice(0, 10),
  });
  saveFeedback(feedback);
}

// Component suggestions
function getRequests() { return getData(KEYS.componentRequests); }
function saveRequests(r) { setData(KEYS.componentRequests, r); }
function addRequest(entityId, userId, name) {
  const requests = getRequests();
  requests.push({
    id: makeId(),
    entityId,
    userId,
    name,
    status: "Pending",
    date: new Date().toISOString().slice(0, 10),
  });
  saveRequests(requests);
}
function updateRequestStatus(id, status) {
  const requests = getRequests();
  const r = requests.find((x) => x.id === id);
  if (r) { r.status = status; saveRequests(requests); }
}

// ---- Simple analytics helpers ----

// Average rating for a list of feedback items (rounded to 1 decimal)
function averageRating(feedbackList) {
  if (!feedbackList.length) return 0;
  const sum = feedbackList.reduce((s, f) => s + f.rating, 0);
  return Math.round((sum / feedbackList.length) * 10) / 10;
}

// Overall average rating for an entity (across all its components)
function entityRating(entityId) {
  const compIds = getComponentsByEntity(entityId).map((c) => c.id);
  const list = getFeedback().filter((f) => compIds.includes(f.componentId));
  return averageRating(list);
}

// Count total feedback for an entity
function entityFeedbackCount(entityId) {
  const compIds = getComponentsByEntity(entityId).map((c) => c.id);
  return getFeedback().filter((f) => compIds.includes(f.componentId)).length;
}

// Count feedback by type for an entity
function feedbackTypeCounts(entityId) {
  const compIds = getComponentsByEntity(entityId).map((c) => c.id);
  const list = getFeedback().filter((f) => compIds.includes(f.componentId));
  const counts = { Review: 0, Complaint: 0, Suggestion: 0, Appreciation: 0 };
  list.forEach((f) => { if (counts[f.type] !== undefined) counts[f.type]++; });
  return counts;
}

// Export everything so other files can use it
export {
  KEYS, makeId,
  getUsers, findUserByEmail, addUser, getUserName,
  getCurrentUser, setCurrentUser, clearCurrentUser,
  getEntities, getEntity, addEntity, updateEntity, deleteEntity,
  getComponents, getComponentsByEntity, getComponent, addComponent, updateComponent, deleteComponent,
  getFeedback, getFeedbackByComponent, getFeedbackByUser, addFeedback,
  getRequests, addRequest, updateRequestStatus,
  averageRating, entityRating, entityFeedbackCount, feedbackTypeCounts,
};
