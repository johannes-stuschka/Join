const ICON_PATH = "../assets/icons/"; // Dateinamen anpassen

const PRIORITIES = [
    { key: "urgent", label: "Urgent", icon: ICON_PATH + "Prio_urgent.svg" },
    { key: "medium", label: "Medium", icon: ICON_PATH + "Prio_medium.svg" },
    { key: "low", label: "Low", icon: ICON_PATH + "Prio_low.svg" },
];

// Platzhalter, später aus euren Daten
const CONTACTS = ["Anna Schmidt", "Ben Weber", "Clara Fischer"];
const CATEGORIES = ["Technical Task", "User Story"];

let selectedPriority = "medium";
let assignedContacts = [];
let subtasks = [];
let selectedCategory = "";
let addTaskCallback = null;
let categoryTouched = false;
let editingSubtask = -1;

const REQUIRED_FIELDS = {
    title: { inputId: "task-title", errorId: "title-error" },
    dueDate: { inputId: "task-due-date", errorId: "dueDate-error" },
    category: { inputId: "category-toggle", errorId: "category-error" },
};

function initAddTask(callback = null, task = null) {
    addTaskCallback = callback;
    resetAddTaskState();
    if (task) fillForm(task);
    initState();
    addFormListeners();
    updateCreateButton();
}

function fillForm(task) {
    document.getElementById("task-title").value = task.title;
    document.getElementById("task-description").value = task.description;
    document.getElementById("task-due-date").value = task.dueDate;
    selectedPriority = task.priority;
    selectedCategory = task.category;
    assignedContacts = task.assigned.map((user) => user.name);
    subtasks = task.subtasks.map((subtask) => subtask.text);
}

function initAddTaskPage() {
    document.getElementById("add-task-page").innerHTML = getAddTaskFormTemplate(true);
    initAddTask();
}

function resetAddTaskState() {
    selectedPriority = "medium";
    selectedCategory = "";
    assignedContacts = [];
    subtasks = [];
    categoryTouched = false;
    editingSubtask = -1;
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
    renderSelectedAvatars();
}

function renderSelectedAvatars() {
    document.getElementById("selected-avatars").innerHTML = assignedContacts
        .map((name) => getSelectedAvatarTemplate(toAvatar(name)))
        .join("");
}

function toggleDropdown(id) {
    document.getElementById(id).classList.toggle("open");
    if (id === "category-dropdown") categoryTouched = true;
    checkCategoryOnClose();
}

function closeDropdownOnOutsideClick(event) {
    document.querySelectorAll(".dropdown").forEach((dropdown) => {
        if (!dropdown.contains(event.target)) dropdown.classList.remove("open");
    });
    checkCategoryOnClose();
}

function checkCategoryOnClose() {
    const dropdown = document.getElementById("category-dropdown");
    if (!dropdown || dropdown.classList.contains("open")) return;
    if (categoryTouched) validateField("category");
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
        .map((text, i) => getSubtaskTemplate(text, i, i === editingSubtask))
        .join("");
}

function editSubtask(index) {
    editingSubtask = index;
    renderSubtasks();
    const input = document.getElementById("subtask-edit");
    input.value = subtasks[index];
    input.focus();
}

function saveSubtask(index, value) {
    if (editingSubtask !== index) return;
    const text = value.trim();
    editingSubtask = -1;
    if (text) subtasks[index] = text;
    renderSubtasks();
}

function confirmSubtaskEdit(index) {
    saveSubtask(index, document.getElementById("subtask-edit").value);
}

function cancelSubtaskEdit() {
    editingSubtask = -1;
    renderSubtasks();
}

function handleSubtaskEditKey(event, index) {
    if (event.key === "Enter") {
        event.preventDefault();
        confirmSubtaskEdit(index);
    }
    if (event.key === "Escape") cancelSubtaskEdit();
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

function isFieldValid(name) {
    if (name === "title") return document.getElementById("task-title").value.trim() !== "";
    if (name === "dueDate") return document.getElementById("task-due-date").value !== "";
    return selectedCategory !== "";
}

function isFormValid() {
    return Object.keys(REQUIRED_FIELDS).every((name) => isFieldValid(name));
}

function validateField(name) {
    const field = REQUIRED_FIELDS[name];
    const valid = isFieldValid(name);
    document.getElementById(field.errorId).hidden = valid;
    document.getElementById(field.inputId).classList.toggle("invalid", !valid);
    return valid;
}

function validateAll() {
    return Object.keys(REQUIRED_FIELDS).map((name) => validateField(name)).every(Boolean);
}

function refreshVisibleErrors() {
    Object.keys(REQUIRED_FIELDS).forEach((name) => {
        const errorHidden = document.getElementById(REQUIRED_FIELDS[name].errorId).hidden;
        if (!errorHidden) validateField(name);
    });
}

function clearErrors() {
    Object.values(REQUIRED_FIELDS).forEach(({ inputId, errorId }) => {
        document.getElementById(errorId).hidden = true;
        document.getElementById(inputId).classList.remove("invalid");
    });
}

function handleFocusOut(event) {
    const name = { "task-title": "title", "task-due-date": "dueDate" }[event.target.id];
    if (!name) return;
    const field = event.target.closest(".field");
    if (field && field.contains(event.relatedTarget)) return;
    validateField(name);
}

function updateCreateButton() {
    document.getElementById("create-task-btn").disabled = !isFormValid();
    refreshVisibleErrors();
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
    if (!validateAll()) return;
    const task = getTaskFromForm();
    if (addTaskCallback) return addTaskCallback(task);
    console.log("Neuer Task:", task); // TODO: später speichern
    event.target.reset();
}

function handleReset() {
    resetAddTaskState();
    setTimeout(() => {
        initState();
        clearErrors();
        updateCreateButton();
    });
}

function initState() {
    renderPriorities();
    renderContacts();
    renderCategories();
    renderSubtasks();
    renderSelectedAvatars();
}

function blockEnter(event) {
    if (event.key === "Enter") event.preventDefault();
}

function addFormListeners() {
    const form = document.getElementById("add-task-form");
    form.addEventListener("input", updateCreateButton);
    form.addEventListener("change", updateCreateButton);
    form.addEventListener("submit", handleSubmit);
    form.addEventListener("reset", handleReset);
    form.addEventListener("focusout", handleFocusOut);
    document.getElementById("task-title").addEventListener("keydown", blockEnter);
    document.getElementById("subtask-input").addEventListener("keydown", addSubtask);
    document.getElementById("assigned-toggle").addEventListener("click", () => toggleDropdown("assigned-dropdown"));
    document.getElementById("category-toggle").addEventListener("click", () => toggleDropdown("category-dropdown"));
}

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

document.addEventListener("click", closeDropdownOnOutsideClick);

const AVATAR_COLORS = ["#ff7a00", "#1fd7c1", "#9327ff", "#ff70ff", "#ff4646", "#00bee8", "#6e52ff"];

function toAvatar(name) {
    const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
    const sum = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return { name, initials, color: AVATAR_COLORS[sum % AVATAR_COLORS.length] };
}
