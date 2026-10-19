const OWN_CONTACT_COLOR = "#29abe2";


// Builds the path to an icon in assets/icons.
function getIconPath(name) {
  return getRootPath() + "assets/icons/" + name + ".svg";
}


// Shows the lock icon for an empty field, otherwise the eye icon that matches the current visibility.
function renderPasswordIcon(input, button) {
  const icon = button.querySelector("img");
  const isFilled = input.value !== "";
  const isHidden = input.type === "password";
  button.disabled = !isFilled;
  if (!isFilled) icon.src = getIconPath("input_lock");
  else icon.src = getIconPath(isHidden ? "input_visibility_off" : "input_visibility");
}


// Hides the password again once the field is empty.
function resetPasswordType(input, button) {
  if (input.value === "") input.type = "password";
  renderPasswordIcon(input, button);
}


// Switches the password between hidden and visible.
function togglePasswordVisibility(input, button) {
  input.type = input.type === "password" ? "text" : "password";
  renderPasswordIcon(input, button);
}


// Connects a password input to its show/hide button.
function initPasswordField(input) {
  const button = input.parentElement.querySelector(".field-toggle");
  input.addEventListener("input", () => resetPasswordType(input, button));
  button.addEventListener("click", () => togglePasswordVisibility(input, button));
}


// Gives the field around an input a red border.
function markInvalid(input) {
  input.closest(".field").classList.add("error");
}


// Marks an input as invalid and shows the message below it.
function showFieldError(input, message) {
  markInvalid(input);
  const error = input.closest(".field-group").querySelector(".field-error");
  error.textContent = message;
  error.hidden = false;
}


// Removes the error state and message from an input.
function clearFieldError(input) {
  input.closest(".field").classList.remove("error");
  const error = input.closest(".field-group").querySelector(".field-error");
  error.textContent = "";
  error.hidden = true;
}


// Loads all registered users that have an email address.
async function loadUsers() {
  const users = await loadData("users");
  if (users && users.error) throw new Error(users.error);
  return Object.values(users || {}).filter((user) => user && typeof user.email === "string");
}


// Trims an email address and makes it lowercase so it can be compared.
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}


// Adds the user to the contacts unless a contact with the same email already exists.
async function ensureOwnContact(user) {
  const contacts = toList(await loadData("contacts"));
  const exists = contacts.some((contact) => normalizeEmail(contact.email || "") === normalizeEmail(user.email));
  if (exists) return;
  await postData("contacts", { name: user.name || user.email, email: user.email, phone: "", color: OWN_CONTACT_COLOR });
}
