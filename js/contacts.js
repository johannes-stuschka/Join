const AVATAR_COLORS = [
  "#ff7a00", "#9327ff", "#6e52ff", "#fc71ff", "#ffbb2b",
  "#1fd7c1", "#462f8a", "#ff4646", "#00bee8",
];

let contacts = [
  { id: 1, name: "Anton Mayer", email: "antom@gmail.com", phone: "+49 1111 111 11 1", color: "#ff7a00" },
  { id: 2, name: "Anja Schulz", email: "schulz@hotmail.com", phone: "+49 2222 222 22 2", color: "#9327ff" },
  { id: 3, name: "Benedikt Ziegler", email: "benedikt@gmail.com", phone: "+49 3333 333 33 3", color: "#6e52ff" },
  { id: 4, name: "David Eisenberg", email: "davidberg@gmail.com", phone: "+49 4444 444 44 4", color: "#fc71ff" },
  { id: 5, name: "Eva Fischer", email: "eva@gmail.com", phone: "+49 5555 555 55 5", color: "#ffbb2b" },
  { id: 6, name: "Emmanuel Mauer", email: "emmanuelma@gmail.com", phone: "+49 6666 666 66 6", color: "#1fd7c1" },
  { id: 7, name: "Marcel Bauer", email: "bauer@gmail.com", phone: "+49 7777 777 77 7", color: "#462f8a" },
  { id: 8, name: "Tatjana Wolf", email: "wolf@gmail.com", phone: "+49 2222 22 222 2", color: "#ff4646" },
];

let selectedContactId = null;
let editingContactId = null;
let toastTimeout = null;

function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return escapeHtml((first + last).toUpperCase());
}

function getContactById(id) {
  return contacts.find((contact) => contact.id === id);
}

function sortContacts() {
  contacts.sort((a, b) => a.name.localeCompare(b.name));
}

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

function renderContactDetail() {
  const contact = getContactById(selectedContactId);
  document.getElementById("contact-detail").innerHTML = contact ? getContactDetailTemplate(contact) : "";
}

function selectContact(id) {
  selectedContactId = id;
  renderContactList();
  renderContactDetail();
}

function openAddContact() {
  editingContactId = null;
  const dialog = document.getElementById("contact-dialog");
  dialog.classList.remove("is-edit");
  document.getElementById("contact-dialog-title").textContent = "Add contact";
  document.getElementById("contact-form-avatar").innerHTML = getAvatarPlaceholderTemplate();
  resetContactForm();
  dialog.showModal();
}

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

function closeContactDialog() {
  document.getElementById("contact-dialog").close();
}

function closeDialogOnBackdropClick(event) {
  if (event.target === event.currentTarget) closeContactDialog();
}

function resetContactForm() {
  document.getElementById("contact-form").reset();
  document.querySelectorAll(".input-field").forEach((field) => setFieldError(field, ""));
}

function setFieldError(field, message) {
  field.classList.toggle("invalid", Boolean(message));
  field.querySelector(".input-error").textContent = message;
}

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

function validateContactForm() {
  const inputs = document.querySelectorAll("#contact-form input");
  return [...inputs].map(validateField).every(Boolean);
}

function getContactFromForm() {
  return {
    name: document.getElementById("contact-name").value.trim(),
    email: document.getElementById("contact-email").value.trim(),
    phone: document.getElementById("contact-phone").value.trim(),
  };
}

function handleContactSubmit(event) {
  event.preventDefault();
  if (!validateContactForm()) return;
  if (editingContactId) {
    updateContact(editingContactId, getContactFromForm());
  } else {
    createContact(getContactFromForm());
  }
  closeContactDialog();
}

function createContact(data) {
  const id = Math.max(0, ...contacts.map((contact) => contact.id)) + 1;
  const color = AVATAR_COLORS[contacts.length % AVATAR_COLORS.length];
  contacts.push({ id, ...data, color });
  selectContact(id);
  showToast("Contact successfully created");
}

function updateContact(id, data) {
  Object.assign(getContactById(id), data);
  selectContact(id);
}

function deleteContact(id) {
  contacts = contacts.filter((contact) => contact.id !== id);
  if (selectedContactId === id) selectedContactId = null;
  renderContactList();
  renderContactDetail();
}

function deleteEditingContact() {
  deleteContact(editingContactId);
  closeContactDialog();
}

function showToast(message) {
  const toast = document.getElementById("contact-toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2000);
}

function addContactListeners() {
  const form = document.getElementById("contact-form");
  form.addEventListener("submit", handleContactSubmit);
  form.addEventListener("focusout", (event) => {
    if (event.target.matches("input")) validateField(event.target);
  });
  document.getElementById("contact-dialog").addEventListener("click", closeDialogOnBackdropClick);
}

function initContacts() {
  renderContactList();
  addContactListeners();
}

document.addEventListener("DOMContentLoaded", initContacts);
