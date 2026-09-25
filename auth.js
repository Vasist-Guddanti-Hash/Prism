// auth.js
// Handles signup and login for users, and login for admin.
// Uses the storage functions from storage.js.

import {
  addUser, findUserByEmail, setCurrentUser, clearCurrentUser, getCurrentUser,
} from "./storage.js";

// Sign up a new user. Returns true if ok, or an error message string.
function signup(name, email, password) {
  if (!name || !email || !password) return "Please fill all fields.";
  if (findUserByEmail(email)) return "Email already registered.";
  const user = {
    id: "u" + Date.now(),
    name,
    email,
    password,
    role: "user",
  };
  addUser(user);
  setCurrentUser(user);
  return true;
}

// Login for both users and admin. Returns true or an error message.
function login(email, password) {
  const user = findUserByEmail(email);
  if (!user) return "No account found for this email.";
  if (user.password !== password) return "Wrong password.";
  setCurrentUser(user);
  return true;
}

// Log out the current user
function logout() {
  clearCurrentUser();
}

// Check if someone is logged in
function isLoggedIn() {
  return getCurrentUser() !== null;
}

// Check if the current user is an admin
function isAdmin() {
  const u = getCurrentUser();
  return u && u.role === "admin";
}

export { signup, login, logout, isLoggedIn, isAdmin };
