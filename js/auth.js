const CURRENT_USER_KEY = "currentUser";


function getRootPath() {
  return window.location.pathname.includes("/pages/") ? "../" : "./";
}


function setCurrentUser(user) {
  const data = { name: user.name, email: user.email, isGuest: user.isGuest };
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data));
  } catch (error) {
    return;
  }
}


function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  } catch (error) {
    return null;
  }
}


function logout() {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch (error) {
  }
  window.location.href = getRootPath() + "index.html";
}


function requireLogin() {
  if (!getCurrentUser()) {
    window.location.replace(getRootPath() + "index.html");
  }
}
