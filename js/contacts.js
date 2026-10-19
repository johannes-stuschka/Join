const AVATAR_COLORS = [
  "#ff7a00", "#9327ff", "#6e52ff", "#fc71ff", "#ffbb2b",
  "#1fd7c1", "#462f8a", "#ff4646", "#00bee8",
];

const DEFAULT_CONTACTS = [
  { name: "Lena Hoffmann", email: "lena.hoffmann@gmail.com", phone: "+49 1511 234 56 7", color: "#ff7a00" },
  { name: "Jonas Becker", email: "jonas.becker@gmail.com", phone: "+49 1522 345 67 8", color: "#9327ff" },
  { name: "Mia Schneider", email: "mia.schneider@gmail.com", phone: "+49 1533 456 78 9", color: "#6e52ff" },
  { name: "Felix Wagner", email: "felix.wagner@gmail.com", phone: "+49 1544 567 89 0", color: "#fc71ff" },
  { name: "Clara Richter", email: "clara.richter@gmail.com", phone: "+49 1555 678 90 1", color: "#ffbb2b" },
  { name: "Lukas Neumann", email: "lukas.neumann@gmail.com", phone: "+49 1566 789 01 2", color: "#1fd7c1" },
  { name: "Nora Krause", email: "nora.krause@gmail.com", phone: "+49 1577 890 12 3", color: "#462f8a" },
  { name: "Paul Schäfer", email: "paul.schaefer@gmail.com", phone: "+49 1588 901 23 4", color: "#ff4646" },
  { name: "Hannah Vogel", email: "hannah.vogel@gmail.com", phone: "+49 1599 012 34 5", color: "#00bee8" },
  { name: "Tim Hartmann", email: "tim.hartmann@gmail.com", phone: "+49 1600 123 45 6", color: "#ff745e" },
];

let contacts = [];

let selectedContactId = null;
let editingContactId = null;
let toastTimeout = null;

// Returns the initials from the first and last name.
function getContactInitials(name) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return escapeHtml((first + last).toUpperCase());
}

// Checks whether a contact belongs to the logged-in user.
function isOwnContact(contact) {
  const user = getCurrentUser();
  if (!user || !user.email) return false;
  return (contact.email || "").trim().toLowerCase() === user.email.trim().toLowerCase();
}

// Finds a contact by id.
function getContactById(id) {
  return contacts.find((contact) => contact.id === id);
}

// Sorts the contacts alphabetically by name.
function sortContacts() {
  contacts.sort((a, b) => a.name.localeCompare(b.name));
}

// Renders the contact list grouped by first letter.
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

// Shows the selected contact, or clears the detail view.
function renderContactDetail() {
  const contact = getContactById(selectedContactId);
  const detail = document.getElementById("contact-detail");
  detail.innerHTML = contact ? getContactDetailTemplate(contact) : "";
  detail.classList.remove("options-open");
  document.querySelector(".contacts").classList.toggle("has-selection", Boolean(contact));
}

// Opens or closes the edit/delete menu on mobile.
function toggleContactOptions(event) {
  event.stopPropagation();
  document.getElementById("contact-detail").classList.toggle("options-open");
}

// Closes the edit/delete menu on mobile.
function closeContactOptions() {
  document.getElementById("contact-detail").classList.remove("options-open");
}

// Selects a contact, or deselects it if it is already selected.
function toggleContactSelection(id) {
  selectContact(selectedContactId === id ? null : id);
}

// Selects a contact and renders list and detail.
function selectContact(id) {
  selectedContactId = id;
  renderContactList();
  renderContactDetail();
}

// Opens the dialog with an empty form for a new contact.
function openAddContact() {
  editingContactId = null;
  const dialog = document.getElementById("contact-dialog");
  dialog.classList.remove("is-edit");
  document.getElementById("contact-dialog-title").textContent = "Add contact";
  document.getElementById("contact-form-avatar").innerHTML = getAvatarPlaceholderTemplate();
  resetContactForm();
  dialog.showModal();
}

// Opens the dialog with the data of an existing contact.
function openEditContact(id) {
  const contact = getContactById(id);
  editingContactId = id;
  const dialog = document.getElementById("contact-dialog");
  dialog.classList.add("is-edit");
  document.getElementById("contact-dialog-title").textContent = "Edit contact";
  document.getElementById("contact-form-avatar").innerHTML = getAvatarTemplate(contact, "avatar-lg");
  resetContactForm();
  document.getElementById("contact-name").value = contact.name;
  document.getElementById("contact-email").value = contact.email;
  document.getElementById("contact-phone").value = contact.phone;
  dialog.showModal();
}

// Closes the contact dialog.
function closeContactDialog() {
  document.getElementById("contact-dialog").close();
}

// Closes the dialog when the backdrop is clicked.
function closeDialogOnBackdropClick(event) {
  if (event.target === event.currentTarget) closeContactDialog();
}

// Empties the form and removes all errors.
function resetContactForm() {
  document.getElementById("contact-form").reset();
  document.querySelectorAll(".input-field").forEach((field) => setFieldError(field, ""));
}

// Shows or hides the error of a form field.
function setFieldError(field, message) {
  field.classList.toggle("invalid", Boolean(message));
  field.querySelector(".input-error").textContent = message;
}

// Checks one input: required, email format or phone format.
function validateField(input) {
  const field = input.closest(".input-field");
  const value = input.value.trim();
  let message = "";
  if (!value) message = "This field is required";
  else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) message = "Please enter a valid email";
  else if (input.type === "tel" && !/^\+?[0-9 ()/-]{6,}$/.test(value)) message = "Please enter a valid phone number";
  setFieldError(field, message);
  return !message;
}

// Checks every input of the contact form.
function validateContactForm() {
  const inputs = document.querySelectorAll("#contact-form input");
  return [...inputs].map(validateField).every(Boolean);
}

// Reads name, email and phone from the form.
function getContactFromForm() {
  return {
    name: document.getElementById("contact-name").value.trim(),
    email: document.getElementById("contact-email").value.trim(),
    phone: document.getElementById("contact-phone").value.trim(),
  };
}

// Saves the form as a new or edited contact.
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

// Saves a new contact with a color and selects it.
async function createContact(data) {
  const color = AVATAR_COLORS[contacts.length % AVATAR_COLORS.length];
  const contact = { ...data, color };
  const result = await postData("contacts", contact);
  contacts.push({ ...contact, id: result.name });
  selectContact(result.name);
  showToast("Contact successfully created");
}

// Saves changes to a contact.
async function updateContact(id, data) {
  await patchData(`contacts/${id}`, data);
  Object.assign(getContactById(id), data);
  selectContact(id);
}

// Removes a contact from every task it was assigned to.
async function removeContactFromTasks(name) {
  const tasks = toList(await loadData("tasks"));
  const affected = tasks.filter((task) => (task.assigned || []).some((user) => user.name === name));
  await Promise.all(affected.map((task) =>
    putData(`tasks/${task.id}/assigned`, task.assigned.filter((user) => user.name !== name)),
  ));
}

// Deletes a contact and removes it from all tasks.
async function deleteContact(id) {
  try {
    await deleteData(`contacts/${id}`);
    await removeContactFromTasks(getContactById(id).name);
  } catch (error) {
    return showToast("Contact could not be deleted");
  }
  contacts = contacts.filter((contact) => contact.id !== id);
  if (selectedContactId === id) selectedContactId = null;
  renderContactList();
  renderContactDetail();
}

// Deletes the contact that is open in the dialog.
async function deleteEditingContact() {
  await deleteContact(editingContactId);
  closeContactDialog();
}

// Shows a short message at the bottom of the page.
function showToast(message) {
  const toast = document.getElementById("contact-toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2000);
}

// Adds the listeners for form, dialog and options menu.
function addContactListeners() {
  const form = document.getElementById("contact-form");
  form.addEventListener("submit", handleContactSubmit);
  form.addEventListener("focusout", (event) => {
    if (event.target.matches("input")) validateField(event.target);
  });
  document.getElementById("contact-dialog").addEventListener("click", closeDialogOnBackdropClick);
  document.addEventListener("click", closeContactOptions);
}

// Saves the default contacts when the database is empty.
async function seedContacts() {
  for (const contact of DEFAULT_CONTACTS) {
    await postData("contacts", contact);
  }
  return await loadData("contacts");
}

// Loads the contacts, or creates the defaults first.
async function loadContacts() {
  let data = await loadData("contacts");
  if (!data) data = await seedContacts();
  contacts = toList(data);
}

// Sets up the contacts page.
async function initContacts() {
  addContactListeners();
  try {
    await loadContacts();
  } catch (error) {
    showToast("Contacts could not be loaded");
  }
  renderContactList();
}

document.addEventListener("DOMContentLoaded", initContacts);
