function getIconPath(name) {
  return getRootPath() + "assets/icons/" + name + ".svg";
}


function renderPasswordIcon(input, button) {
  const icon = button.querySelector("img");
  const isFilled = input.value !== "";
  const isHidden = input.type === "password";
  button.disabled = !isFilled;
  if (!isFilled) icon.src = getIconPath("input_lock");
  else icon.src = getIconPath(isHidden ? "input_visibility_off" : "input_visibility");
}


function resetPasswordType(input, button) {
  if (input.value === "") input.type = "password";
  renderPasswordIcon(input, button);
}


function togglePasswordVisibility(input, button) {
  input.type = input.type === "password" ? "text" : "password";
  renderPasswordIcon(input, button);
}


function initPasswordField(input) {
  const button = input.parentElement.querySelector(".field-toggle");
  input.addEventListener("input", () => resetPasswordType(input, button));
  button.addEventListener("click", () => togglePasswordVisibility(input, button));
}


function markInvalid(input) {
  input.closest(".field").classList.add("error");
}


function showFieldError(input, message) {
  markInvalid(input);
  const error = input.closest(".field-group").querySelector(".field-error");
  error.textContent = message;
  error.hidden = false;
}


function clearFieldError(input) {
  input.closest(".field").classList.remove("error");
  const error = input.closest(".field-group").querySelector(".field-error");
  error.textContent = "";
  error.hidden = true;
}


async function loadUsers() {
  const users = await loadData("users");
  if (users && users.error) throw new Error(users.error);
  return Object.values(users || {}).filter((user) => user && typeof user.email === "string");
}


function normalizeEmail(email) {
  return email.trim().toLowerCase();
}
