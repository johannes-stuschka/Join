const EMAIL_REGEX = /^[a-z0-9_%+-]+(\.[a-z0-9_%+-]+)*@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
const MIN_PASSWORD_LENGTH = 6;
const REDIRECT_DELAY = 1500;
const GENERAL_ERROR = "Something went wrong. Please try again later.";
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm-password");
const privacyInput = document.getElementById("privacy");
const signUpButton = document.getElementById("signup-button");
let isSubmitting = false;


// Returns the error message for the name or an empty string.
function getNameError() {
  return nameInput.value.trim() ? "" : "Please enter your name.";
}


// Returns the error message for the email or an empty string.
function getEmailError() {
  const email = emailInput.value.trim();
  if (!email) return "Please enter your email.";
  return EMAIL_REGEX.test(email) ? "" : "Please enter a valid email.";
}


// Returns the error message for the password or an empty string.
function getPasswordError() {
  if (!passwordInput.value) return "Please enter a password.";
  return passwordInput.value.length >= MIN_PASSWORD_LENGTH ? "" : "At least 6 characters required.";
}


// Returns the error message for the password confirmation or an empty string.
function getConfirmError() {
  if (!confirmInput.value) return "Please confirm your password.";
  return confirmInput.value === passwordInput.value ? "" : "Passwords don't match.";
}


const FIELD_CHECKS = new Map([
  [nameInput, getNameError],
  [emailInput, getEmailError],
  [passwordInput, getPasswordError],
  [confirmInput, getConfirmError],
]);


// Checks that every field is valid and the privacy policy is accepted.
function isFormValid() {
  return [...FIELD_CHECKS.values()].every((check) => check() === "") && privacyInput.checked;
}


// Enables the sign-up button only when the form is valid and nothing is being sent.
function updateSubmitState() {
  signUpButton.disabled = isSubmitting || !isFormValid();
}


// Shows or clears the message of one field and returns whether it is valid.
function validateField(input) {
  const message = FIELD_CHECKS.get(input)();
  if (message) showFieldError(input, message);
  else clearFieldError(input);
  return !message;
}


// Checks all fields and shows every message at once.
function validateForm() {
  return [...FIELD_CHECKS.keys()].map(validateField).every(Boolean);
}


// Saves a new user unless the email is already registered.
async function saveUser(user) {
  try {
    const users = await loadUsers();
    if (users.some((entry) => normalizeEmail(entry.email) === normalizeEmail(user.email))) {
      return { field: "This email is already registered." };
    }
    const result = await postData("users", user);
    if (!result || !result.name) return { general: GENERAL_ERROR };
    await ensureOwnContact(user);
    return {};
  } catch (error) {
    return { general: GENERAL_ERROR };
  }
}


// Shows the success toast and goes to the login page.
function showSuccessToast() {
  document.getElementById("toast").classList.add("show");
  setTimeout(() => (window.location.href = "../index.html"), REDIRECT_DELAY);
}


// Shows the error that saveUser returned.
function showSignUpError(result) {
  if (result.field) showFieldError(emailInput, result.field);
  if (result.general) showFieldMessage(confirmInput, result.general);
}


// Handles the sign-up form: validates, saves the user and reacts to the result.
async function handleSignUp(event) {
  event.preventDefault();
  if (!validateForm()) return;
  isSubmitting = true;
  updateSubmitState();
  const user = { name: nameInput.value.trim(), email: emailInput.value.trim(), password: passwordInput.value };
  const result = await saveUser(user);
  if (!result.field && !result.general) return showSuccessToast();
  isSubmitting = false;
  showSignUpError(result);
  updateSubmitState();
}


// Clears the error of the edited field and updates the button.
function handleFormInput(event) {
  if (FIELD_CHECKS.has(event.target)) clearFieldError(event.target);
  if (event.target === passwordInput && !getConfirmError()) clearFieldError(confirmInput);
  updateSubmitState();
}


// Checks a field as soon as the user leaves it.
function handleFieldBlur(event) {
  if (!FIELD_CHECKS.has(event.target)) return;
  validateField(event.target);
  if (event.target === passwordInput && confirmInput.value) validateField(confirmInput);
}


// Sets up the password fields and form listeners.
function initSignUp() {
  const form = document.getElementById("signup-form");
  initPasswordField(passwordInput);
  initPasswordField(confirmInput);
  form.addEventListener("input", handleFormInput);
  form.addEventListener("change", updateSubmitState);
  form.addEventListener("focusout", handleFieldBlur);
  form.addEventListener("submit", handleSignUp);
  updateSubmitState();
}


initSignUp();
