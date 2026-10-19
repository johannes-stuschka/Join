const ICON_PATH = "../assets/icons/"; // Dateinamen anpassen

const PRIORITIES = [
    { key: "urgent", label: "Urgent", icon: ICON_PATH + "Prio_urgent.svg" },
    { key: "medium", label: "Medium", icon: ICON_PATH + "Prio_medium.svg" },
    { key: "low", label: "Low", icon: ICON_PATH + "Prio_low.svg" },
];

let CONTACTS = [];
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

async function loadTaskContacts() {
    const contacts = toList(await loadData("contacts"));
    CONTACTS = contacts.map((contact) => contact.name).sort((a, b) => a.localeCompare(b));
}

async function initAddTaskPage() {
    document.getElementById("add-task-page").innerHTML = getAddTaskFormTemplate(true);
    initAddTask(saveNewTask);
    try {
        await loadTaskContacts();
    } catch (error) {
        console.error(error);
    }
    renderContacts();
}

async function saveNewTask(formTask) {
    await postData("tasks", toBoardTask(formTask, "todo"));
    showToast("Task added to board");
    setTimeout(() => (window.location.href = "board.html"), 2200);
}

function toBoardTask(formTask, status) {
    const { assignedTo, ...fields } = formTask;
    return {
        ...fields,
        status,
        subtasks: formTask.subtasks.map((text) => ({ text, done: false })),
        assigned: assignedTo.map(toAvatar),
    };
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
    showToast("Task added to board");
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

function showToast(message) {
    removeToast();
    document.body.insertAdjacentHTML("beforeend", getToastTemplate(message));
    setTimeout(removeToast, 2200);
}

function removeToast() {
    const toast = document.getElementById("toast");
    if (toast) toast.remove();
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
