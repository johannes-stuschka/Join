const CURRENT_USER_KEY = "currentUser";
const EMAIL_REGEX = /^[a-z0-9_%+-]+(\.[a-z0-9_%+-]+)*@[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+(-[a-z0-9]+)*)?\.[a-z]{2,}$/i;
const REPEATED_TLD_REGEX = /\.([a-z]+)\.\1$/i;


/**
 * Returns the relative path to the project root, depending on whether the page is inside /pages/.
 *
 * @returns {string} "../" or "./".
 */
function getRootPath() {
  return window.location.pathname.includes("/pages/") ? "../" : "./";
}


/**
 * Stores the logged-in user in localStorage.
 *
 * @param {{name: string, email: string, isGuest: boolean}} user - The user to store.
 */
function setCurrentUser(user) {
  const data = { name: user.name, email: user.email, isGuest: user.isGuest };
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data));
  } catch (error) {
    return;
  }
}


/**
 * Reads the logged-in user from localStorage.
 *
 * @returns {Object|null} The stored user, or null.
 */
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  } catch (error) {
    return null;
  }
}


/**
 * Removes the stored user and goes back to the login page.
 */
function logout() {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch (error) {
  }
  window.location.href = getRootPath() + "index.html";
}


/**
 * Sends visitors who are not logged in to the login page.
 *
 * @returns {boolean} True if a user is logged in.
 */
function requireLogin() {
  if (getCurrentUser()) return true;
  window.location.replace(getRootPath() + "index.html");
  return false;
}


/**
 * Checks the email format: one @, no double dots, at most one subdomain and no repeated ending like ".de.de".
 *
 * @param {string} email - The email address to check.
 * @returns {boolean} True if the address looks like a real email.
 */
function isValidEmail(email) {
  return EMAIL_REGEX.test(email) && !REPEATED_TLD_REGEX.test(email);
}
