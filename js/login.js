const GENERAL_ERROR = "Something went wrong. Please try again later.";
const LOGIN_ERROR = "Check your email and password. Please try again.";
const SPLASH_DELAY = 500;
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");
const formError = document.getElementById("loginFormError");


function showLoginError() {
  markInvalid(emailInput);
  showFieldError(passwordInput, LOGIN_ERROR);
}


function showGeneralError() {
  formError.textContent = GENERAL_ERROR;
  formError.hidden = false;
}


function clearLoginError() {
  formError.hidden = true;
  clearFieldError(emailInput);
  clearFieldError(passwordInput);
}


function goToSummary() {
  window.location.href = getRootPath() + "pages/summary.html";
}


function matchesCredentials(user, email, password) {
  return normalizeEmail(user.email) === email && user.password === password;
}


async function findUser(email, password) {
  const users = await loadUsers();
  return users.find((user) => matchesCredentials(user, email, password)) || null;
}


async function authenticate(email, password) {
  try {
    return { user: await findUser(email, password) };
  } catch (error) {
    return { failed: true };
  }
}


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
  goToSummary();
}


function handleGuestLogin() {
  setCurrentUser({ name: "Guest", email: "", isGuest: true });
  goToSummary();
}


function initLogin() {
  initPasswordField(passwordInput);
  emailInput.addEventListener("input", clearLoginError);
  passwordInput.addEventListener("input", clearLoginError);
  document.getElementById("login-form").addEventListener("submit", handleLogin);
  document.getElementById("guest-button").addEventListener("click", handleGuestLogin);
  setTimeout(() => document.body.classList.remove("splash"), SPLASH_DELAY);
}


initLogin();
