const CURRENT_USER_KEY = "currentUser";


// Returns the relative path to the project root, depending on whether the page is inside /pages/.
function getRootPath() {
  return window.location.pathname.includes("/pages/") ? "../" : "./";
}


// Stores the logged-in user in localStorage.
function setCurrentUser(user) {
  const data = { name: user.name, email: user.email, isGuest: user.isGuest };
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data));
  } catch (error) {
    return;
  }
}


// Reads the logged-in user from localStorage.
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  } catch (error) {
    return null;
  }
}


// Removes the stored user and goes back to the login page.
function logout() {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch (error) {
  }
  window.location.href = getRootPath() + "index.html";
}


// Sends visitors who are not logged in to the login page.
function requireLogin() {
  if (!getCurrentUser()) {
    window.location.replace(getRootPath() + "index.html");
  }
}
