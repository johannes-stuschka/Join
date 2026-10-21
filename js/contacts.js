const AVATAR_COLORS = [
  "#ff7a00", "#9327ff", "#6e52ff", "#fc71ff", "#ffbb2b",
  "#1fd7c1", "#462f8a", "#ff4646", "#00bee8",
];

let contacts = [];
let registeredEmails = new Set();

let selectedContactId = null;
let editingContactId = null;
let toastTimeout = null;

/**
 * Returns the initials from the first and last name.
 *
 * @param {string} name - The full name.
 * @returns {string} The escaped initials.
 */
function getContactInitials(name) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return escapeHtml((first + last).toUpperCase());
}

/**
 * Trims an email address and makes it lowercase so it can be compared.
 *
 * @param {string} email - The email address.
 * @returns {string} The normalized email.
 */
function normalizeContactEmail(email) {
  return (email || "").trim().toLowerCase();
}

/**
 * Checks whether a contact belongs to the logged-in user.
 *
 * @param {Object} contact - The contact with name, email, phone and color.
 * @returns {boolean} True if it is the user's own contact.
 */
function isOwnContact(contact) {
  const user = getCurrentUser();
  if (!user || !user.email) return false;
  return normalizeContactEmail(contact.email) === normalizeContactEmail(user.email);
}

/**
 * Checks whether a contact belongs to a registered user and must not be deleted.
 *
 * @param {Object} contact - The contact with name, email, phone and color.
 * @returns {boolean} True if the contact must not be deleted.
 */
function isProtectedContact(contact) {
  return isOwnContact(contact) || registeredEmails.has(normalizeContactEmail(contact.email));
}

/**
 * Finds a contact by id.
 *
 * @param {string} id - The id of the contact.
 * @returns {Object|undefined} The contact, or undefined.
 */
function getContactById(id) {
  return contacts.find((contact) => contact.id === id);
}

/**
 * Sorts the contacts alphabetically by name.
 */
function sortContacts() {
  contacts.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Renders the contact list grouped by first letter.
 */
function renderContactList() {
  sortContacts();
  let html = "";
  let currentLetter = "";
  contacts.forEach((contact) => {
    const letter = contact.name[0].toUpperCase();
    if (letter !== currentLetter) {
      currentLetter = letter;
      html += getContactGroupTemplate(letter);
    }
    html += getContactItemTemplate(contact, contact.id === selectedContactId);
  });
  document.getElementById("contact-list").innerHTML = html;
}

/**
 * Shows the selected contact, or clears the detail view.
 */
function renderContactDetail() {
  const contact = getContactById(selectedContactId);
  const detail = document.getElementById("contact-detail");
  detail.innerHTML = contact ? getContactDetailTemplate(contact) : "";
  detail.classList.remove("options-open");
  document.querySelector(".contacts").classList.toggle("has-selection", Boolean(contact));
}

/**
 * Opens or closes the edit/delete menu on mobile.
 *
 * @param {MouseEvent} event - The click event.
 */
function toggleContactOptions(event) {
  event.stopPropagation();
  document.getElementById("contact-detail").classList.toggle("options-open");
}

/**
 * Closes the edit/delete menu on mobile.
 */
function closeContactOptions() {
  document.getElementById("contact-detail").classList.remove("options-open");
}

/**
 * Selects a contact, or deselects it if it is already selected.
 *
 * @param {string} id - The id of the contact.
 */
function toggleContactSelection(id) {
  selectContact(selectedContactId === id ? null : id);
}

/**
 * Selects a contact and renders list and detail.
 *
 * @param {string|null} id - The id of the contact, or null to deselect.
 */
function selectContact(id) {
  selectedContactId = id;
  renderContactList();
  renderContactDetail();
}

/**
 * Opens the dialog with an empty form for a new contact.
 */
function openAddContact() {
  editingContactId = null;
  const dialog = document.getElementById("contact-dialog");
  dialog.classList.remove("is-edit", "is-protected");
  document.getElementById("contact-dialog-title").textContent = "Add contact";
  document.getElementById("contact-form-avatar").innerHTML = getAvatarPlaceholderTemplate();
  resetContactForm();
  dialog.showModal();
}

/**
 * Opens the dialog with the data of an existing contact.
 *
 * @param {string} id - The id of the contact.
 */
function openEditContact(id) {
  const contact = getContactById(id);
  editingContactId = id;
  const dialog = document.getElementById("contact-dialog");
  dialog.classList.add("is-edit");
  dialog.classList.toggle("is-protected", isProtectedContact(contact));
  document.getElementById("contact-dialog-title").textContent = "Edit contact";
  document.getElementById("contact-form-avatar").innerHTML = getAvatarTemplate(contact, "avatar-lg");
  resetContactForm();
  document.getElementById("contact-name").value = contact.name;
  document.getElementById("contact-email").value = contact.email;
  document.getElementById("contact-phone").value = contact.phone;
  dialog.showModal();
}

/**
 * Closes the contact dialog.
 */
function closeContactDialog() {
  document.getElementById("contact-dialog").close();
}

/**
 * Closes the dialog when the backdrop is clicked.
 *
 * @param {MouseEvent} event - The click event.
 */
function closeDialogOnBackdropClick(event) {
  if (event.target === event.currentTarget) closeContactDialog();
}

/**
 * Empties the form and removes all errors.
 */
function resetContactForm() {
  document.getElementById("contact-form").reset();
  document.querySelectorAll(".input-field").forEach((field) => setFieldError(field, ""));
}

/**
 * Shows or hides the error of a form field.
 *
 * @param {HTMLElement} field - The .input-field wrapper.
 * @param {string} message - The error text, empty to hide it.
 */
function setFieldError(field, message) {
  field.classList.toggle("invalid", Boolean(message));
  field.querySelector(".input-error").textContent = message;
}

/**
 * Checks one input: required, email format or phone format.
 *
 * @param {HTMLInputElement} input - The input field.
 * @returns {boolean} True if the field is valid.
 */
function validateField(input) {
  const field = input.closest(".input-field");
  const value = input.value.trim();
  let message = "";
  if (!value) message = "This field is required";
  else if (input.type === "email" && !isValidEmail(value)) message = "Please enter a valid email";
  else if (input.type === "tel" && !/^\+?[0-9 ()/-]{6,}$/.test(value)) message = "Please enter a valid phone number";
  setFieldError(field, message);
  return !message;
}

/**
 * Checks every input of the contact form.
 *
 * @returns {boolean} True if all inputs are valid.
 */
function validateContactForm() {
  const inputs = document.querySelectorAll("#contact-form input");
  return [...inputs].map(validateField).every(Boolean);
}

/**
 * Reads name, email and phone from the form.
 *
 * @returns {{name: string, email: string, phone: string}} The form values.
 */
function getContactFromForm() {
  return {
    name: document.getElementById("contact-name").value.trim(),
    email: document.getElementById("contact-email").value.trim(),
    phone: document.getElementById("contact-phone").value.trim(),
  };
}

/**
 * Saves the form as a new or edited contact.
 *
 * @param {SubmitEvent} event - The submit event of the form.
 * @returns {Promise<void>}
 */
async function handleContactSubmit(event) {
  event.preventDefault();
  if (!validateContactForm()) return;
  try {
    if (editingContactId) {
      await updateContact(editingContactId, getContactFromForm());
    } else {
      await createContact(getContactFromForm());
    }
    closeContactDialog();
  } catch (error) {
    showToast("Contact could not be saved");
  }
}

/**
 * Saves a new contact with a color and selects it.
 *
 * @param {{name: string, email: string, phone: string}} data - The values from the form.
 * @returns {Promise<void>}
 */
async function createContact(data) {
  const color = AVATAR_COLORS[contacts.length % AVATAR_COLORS.length];
  const contact = { ...data, color };
  const result = await postData("contacts", contact);
  contacts.push({ ...contact, id: result.name });
  selectContact(result.name);
  showToast("Contact successfully created");
}

/**
 * Saves changes to a contact.
 *
 * @param {string} id - The id of the contact.
 * @param {{name: string, email: string, phone: string}} data - The values from the form.
 * @returns {Promise<void>}
 */
async function updateContact(id, data) {
  await patchData(`contacts/${id}`, data);
  Object.assign(getContactById(id), data);
  selectContact(id);
}

/**
 * Removes a contact from every task it was assigned to.
 *
 * @param {string} name - The name of the contact.
 * @returns {Promise<void>}
 */
async function removeContactFromTasks(name) {
  const tasks = toList(await loadData("tasks"));
  const affected = tasks.filter((task) => (task.assigned || []).some((user) => user.name === name));
  await Promise.all(affected.map((task) =>
    putData(`tasks/${task.id}/assigned`, task.assigned.filter((user) => user.name !== name)),
  ));
}

/**
 * Deletes a contact and removes it from all tasks.
 *
 * @param {string} id - The id of the contact.
 * @returns {Promise<void>}
 */
async function deleteContact(id) {
  const contact = getContactById(id);
  if (!contact) return;
  if (isProtectedContact(contact)) return showToast("Registered users can't be deleted");
  try {
    await deleteData(`contacts/${id}`);
    await removeContactFromTasks(contact.name);
  } catch (error) {
    return showToast("Contact could not be deleted");
  }
  contacts = contacts.filter((contact) => contact.id !== id);
  if (selectedContactId === id) selectedContactId = null;
  renderContactList();
  renderContactDetail();
}

/**
 * Deletes the contact that is open in the dialog.
 *
 * @returns {Promise<void>}
 */
async function deleteEditingContact() {
  await deleteContact(editingContactId);
  closeContactDialog();
}

/**
 * Shows a short message at the bottom of the page.
 *
 * @param {string} message - The text to show.
 */
function showToast(message) {
  const toast = document.getElementById("contact-toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2000);
}

/**
 * Adds the listeners for form, dialog and options menu.
 */
function addContactListeners() {
  const form = document.getElementById("contact-form");
  form.addEventListener("submit", handleContactSubmit);
  form.addEventListener("focusout", (event) => {
    if (event.target.matches("input")) validateField(event.target);
  });
  document.getElementById("contact-dialog").addEventListener("click", closeDialogOnBackdropClick);
  document.addEventListener("click", closeContactOptions);
}

/**
 * Loads the contacts from Firebase.
 *
 * @returns {Promise<void>}
 */
async function loadContacts() {
  const data = await loadData("contacts");
  contacts = toList(data);
}

/**
 * Loads the emails of all registered users.
 *
 * @returns {Promise<void>}
 */
async function loadRegisteredEmails() {
  const users = toList(await loadData("users"));
  registeredEmails = new Set(users.map((user) => normalizeContactEmail(user.email)));
}

/**
 * Sets up the contacts page.
 *
 * @returns {Promise<void>}
 */
async function initContacts() {
  if (!requireLogin()) return;
  renderLayout();
  addContactListeners();
  try {
    await Promise.all([loadContacts(), loadRegisteredEmails()]);
  } catch (error) {
    showToast("Contacts could not be loaded");
  }
  renderContactList();
}
