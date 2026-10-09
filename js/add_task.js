const ICON_PATH = "../assets/icons/"; // Dateinamen anpassen

const PRIORITIES = [
    { key: "urgent", label: "Urgent", icon: ICON_PATH + "prio_urgent.svg" },
    { key: "medium", label: "Medium", icon: ICON_PATH + "prio_medium.svg" },
    { key: "low", label: "Low", icon: ICON_PATH + "prio_low.svg" },
];

// Platzhalter, später aus euren Daten
const CONTACTS = ["Anna Schmidt", "Ben Weber", "Clara Fischer"];
const CATEGORIES = ["Technical Task", "User Story"];

let selectedPriority = "medium";
let assignedContacts = [];
let subtasks = [];
let selectedCategory = "";

function initAddTask() {
    renderPriorities();
    renderContacts();
    renderCategories();
    renderSubtasks();
    addFormListeners();
}

function renderPriorities() {
    document.getElementById("prio-buttons").innerHTML = PRIORITIES
        .map((prio) => getPrioButtonTemplate(prio, prio.key === selectedPriority))
        .join("");
}

function selectPriority(key) {
    selectedPriority = key;
    renderPriorities();
}

function renderContacts() {
    document.getElementById("assigned-list").innerHTML = CONTACTS
        .map((contact, i) => getContactOptionTemplate(contact, i, assignedContacts.includes(contact)))
        .join("");
}

function toggleContact(index) {
    const contact = CONTACTS[index];
    if (assignedContacts.includes(contact)) {
        assignedContacts = assignedContacts.filter((c) => c !== contact);
    } else {
        assignedContacts.push(contact);
    }
}

function toggleDropdown(id) {
    document.getElementById(id).classList.toggle("open");
}

function closeDropdownOnOutsideClick(event) {
    document.querySelectorAll(".dropdown").forEach((dropdown) => {
        if (!dropdown.contains(event.target)) dropdown.classList.remove("open");
    });
}

function renderCategories() {
    document.getElementById("category-list").innerHTML = CATEGORIES
        .map((category, i) => getCategoryOptionTemplate(category, i))
        .join("");
    document.getElementById("category-toggle").textContent =
        selectedCategory || "Select task category";
}

function renderSubtasks() {
    document.getElementById("subtask-list").innerHTML = subtasks
        .map((text, i) => getSubtaskTemplate(text, i))
        .join("");
}

function addSubtask(event) {
    if (event.key !== "Enter") return;
    event.preventDefault(); // verhindert Absenden des Formulars
    const input = event.target;
    const text = input.value.trim();
    if (!text) return;
    subtasks.push(text);
    input.value = "";
    renderSubtasks();
}

function deleteSubtask(index) {
    subtasks.splice(index, 1);
    renderSubtasks();
}

function isFormValid() {
    const title = document.getElementById("task-title").value.trim();
    const dueDate = document.getElementById("task-due-date").value;
    return Boolean(title && dueDate && selectedCategory);
}

function updateCreateButton() {
    document.getElementById("create-task-btn").disabled = !isFormValid();
}

function getTaskFromForm() {
    return {
        title: document.getElementById("task-title").value.trim(),
        description: document.getElementById("task-description").value.trim(),
        dueDate: document.getElementById("task-due-date").value,
        priority: selectedPriority,
        assignedTo: [...assignedContacts],
        category: selectedCategory,
        subtasks: [...subtasks],
    };
}

function handleSubmit(event) {
    event.preventDefault();
    if (!isFormValid()) return;
    console.log("Neuer Task:", getTaskFromForm()); // TODO: später speichern
    event.target.reset();
}

function handleReset() {
    selectedPriority = "medium";
    selectedCategory = "";
    assignedContacts = [];
    subtasks = [];
    setTimeout(() => {
        initState();
        updateCreateButton();
    });
}

function initState() {
    renderPriorities();
    renderContacts();
    renderCategories();
    renderSubtasks();
}

function addFormListeners() {
    const form = document.getElementById("add-task-form");
    form.addEventListener("input", updateCreateButton);
    form.addEventListener("change", updateCreateButton);
    form.addEventListener("submit", handleSubmit);
    form.addEventListener("reset", handleReset);
    document.getElementById("subtask-input").addEventListener("keydown", addSubtask);
    document.getElementById("assigned-toggle").addEventListener("click", () => toggleDropdown("assigned-dropdown"));
    document.getElementById("category-toggle").addEventListener("click", () => toggleDropdown("category-dropdown"));
    document.addEventListener("click", closeDropdownOnOutsideClick);
}

document.addEventListener("DOMContentLoaded", initAddTask);

function openDatePicker() {
    const input = document.getElementById("task-due-date");
    if (input.showPicker) {
        input.showPicker();
    } else {
        input.focus();
    }
}

function selectCategory(index) {
    selectedCategory = CATEGORIES[index];
    renderCategories();
    document.getElementById("category-dropdown").classList.remove("open");
    updateCreateButton();
}