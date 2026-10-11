const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;
const REDIRECT_DELAY = 1500;
const GENERAL_ERROR = "Something went wrong. Please try again later.";
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm-password");
const privacyInput = document.getElementById("privacy");
const signUpButton = document.getElementById("signup-button");
const formError = document.getElementById("signUpFormError");
let isSubmitting = false;


function isFormComplete() {
  const inputs = [nameInput, emailInput, passwordInput, confirmInput];
  return inputs.every((input) => input.value.trim() !== "") && privacyInput.checked;
}


function updateSubmitState() {
  signUpButton.disabled = isSubmitting || !isFormComplete();
}


function validateField(input, isValid, message) {
  if (!isValid) showFieldError(input, message);
  return isValid;
}


function validateForm() {
  const results = [
    validateField(nameInput, nameInput.value.trim() !== "", "Please enter your name."),
    validateField(emailInput, EMAIL_REGEX.test(emailInput.value.trim()), "Please enter a valid email address."),
    validateField(passwordInput, passwordInput.value.length >= MIN_PASSWORD_LENGTH, "Your password must have at least 6 characters."),
    validateField(confirmInput, confirmInput.value === passwordInput.value, "Your passwords don't match. Please try again."),
  ];
  return results.every(Boolean);
}


async function saveUser(user) {
  try {
    const users = await loadUsers();
    if (users.some((entry) => normalizeEmail(entry.email) === normalizeEmail(user.email))) {
      return { field: "This email address is already registered." };
    }
    const result = await postData("users", user);
    return result && result.name ? {} : { general: GENERAL_ERROR };
  } catch (error) {
    return { general: GENERAL_ERROR };
  }
}


function showSuccessToast() {
  document.getElementById("toast").classList.add("show");
  setTimeout(() => (window.location.href = "../index.html"), REDIRECT_DELAY);
}


function showSignUpError(result) {
  if (result.field) showFieldError(emailInput, result.field);
  formError.textContent = result.general || "";
  formError.hidden = !result.general;
}


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


function handleFormInput(event) {
  if (event.target.type !== "checkbox") clearFieldError(event.target);
  formError.hidden = true;
  updateSubmitState();
}


function initSignUp() {
  const form = document.getElementById("signup-form");
  initPasswordField(passwordInput);
  initPasswordField(confirmInput);
  form.addEventListener("input", handleFormInput);
  form.addEventListener("change", updateSubmitState);
  form.addEventListener("submit", handleSignUp);
  updateSubmitState();
}


initSignUp();
