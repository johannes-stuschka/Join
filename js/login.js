const GENERAL_ERROR = "Something went wrong. Please try again later.";
const LOGIN_ERROR = "Check your email and password. Please try again.";
const SPLASH_DELAY = 500;
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");


// Marks both fields and shows the wrong-credentials message.
function showLoginError() {
  markInvalid(emailInput);
  showFieldError(passwordInput, LOGIN_ERROR);
}


// Shows the general error when the users could not be loaded.
function showGeneralError() {
  clearLoginError();
  showFieldMessage(passwordInput, GENERAL_ERROR);
}


// Hides all login errors.
function clearLoginError() {
  clearFieldError(emailInput);
  clearFieldError(passwordInput);
}


// Opens the summary page.
function goToSummary() {
  window.location.href = getRootPath() + "pages/summary.html";
}


// Checks whether a user has this email and password.
function matchesCredentials(user, email, password) {
  return normalizeEmail(user.email) === email && user.password === password;
}


// Looks for the user with these credentials.
async function findUser(email, password) {
  const users = await loadUsers();
  return users.find((user) => matchesCredentials(user, email, password)) || null;
}


// Runs findUser and catches network errors.
async function authenticate(email, password) {
  try {
    return { user: await findUser(email, password) };
  } catch (error) {
    return { failed: true };
  }
}


// Handles the login form: checks the input, logs the user in and opens the summary.
async function handleLogin(event) {
  event.preventDefault();
  const email = normalizeEmail(emailInput.value);
  if (!email || !passwordInput.value) return showLoginError();
  loginButton.disabled = true;
  const { user, failed } = await authenticate(email, passwordInput.value);
  if (!user) loginButton.disabled = false;
  if (failed) return showGeneralError();
  if (!user) return showLoginError();
  setCurrentUser({ name: user.name || "", email: user.email, isGuest: false });
  await ensureOwnContact(user).catch(() => {});
  goToSummary();
}


// Logs in as guest and opens the summary.
function handleGuestLogin() {
  setCurrentUser({ name: "Guest", email: "", isGuest: true });
  goToSummary();
}


// Sets up the login form and hides the splash logo after a short delay.
function initLogin() {
  initPasswordField(passwordInput);
  emailInput.addEventListener("input", clearLoginError);
  passwordInput.addEventListener("input", clearLoginError);
  document.getElementById("login-form").addEventListener("submit", handleLogin);
  document.getElementById("guest-button").addEventListener("click", handleGuestLogin);
  setTimeout(() => document.body.classList.remove("splash"), SPLASH_DELAY);
}


initLogin();
