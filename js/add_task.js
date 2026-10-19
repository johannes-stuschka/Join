const ICON_PATH = "../assets/icons/";

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

// Sets up the add task form. Pass a task to fill the form for editing.
function initAddTask(callback = null, task = null) {
    addTaskCallback = callback;
    resetAddTaskState();
    if (task) fillForm(task);
    initState();
    addFormListeners();
    updateCreateButton();
}

// Fills the form with the data of a task.
function fillForm(task) {
    document.getElementById("task-title").value = task.title;
    document.getElementById("task-description").value = task.description;
    document.getElementById("task-due-date").value = task.dueDate;
    selectedPriority = task.priority;
    selectedCategory = task.category;
    assignedContacts = task.assigned.map((user) => user.name);
    subtasks = task.subtasks.map((subtask) => subtask.text);
}

// Loads the contact names for the assigned-to dropdown.
async function loadTaskContacts() {
    const contacts = toList(await loadData("contacts"));
    CONTACTS = contacts.map((contact) => contact.name).sort((a, b) => a.localeCompare(b));
}

// Sets up the separate add task page.
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

// Saves a new task in "To do" and goes to the board.
async function saveNewTask(formTask) {
    await postData("tasks", toBoardTask(formTask, "todo"));
    showToast("Task added to board");
    setTimeout(() => (window.location.href = "board.html"), 2200);
}

// Turns form data into the task format the board uses.
function toBoardTask(formTask, status) {
    const { assignedTo, ...fields } = formTask;
    return {
        ...fields,
        status,
        subtasks: formTask.subtasks.map((text) => ({ text, done: false })),
        assigned: assignedTo.map(toAvatar),
    };
}

// Resets priority, category, contacts and subtasks.
function resetAddTaskState() {
    selectedPriority = "medium";
    selectedCategory = "";
    assignedContacts = [];
    subtasks = [];
    categoryTouched = false;
    editingSubtask = -1;
}

// Renders the priority buttons.
function renderPriorities() {
    document.getElementById("prio-buttons").innerHTML = PRIORITIES
        .map((prio) => getPrioButtonTemplate(prio, prio.key === selectedPriority))
        .join("");
}

// Selects a priority.
function selectPriority(key) {
    selectedPriority = key;
    renderPriorities();
}

// Renders the contacts in the assigned-to dropdown.
function renderContacts() {
    document.getElementById("assigned-list").innerHTML = CONTACTS
        .map((contact, i) => getContactOptionTemplate(contact, i, assignedContacts.includes(contact)))
        .join("");
}

// Assigns or unassigns a contact.
function toggleContact(index) {
    const contact = CONTACTS[index];
    if (assignedContacts.includes(contact)) {
        assignedContacts = assignedContacts.filter((c) => c !== contact);
    } else {
        assignedContacts.push(contact);
    }
    renderSelectedAvatars();
}

// Shows the avatars of the assigned contacts below the dropdown.
function renderSelectedAvatars() {
    document.getElementById("selected-avatars").innerHTML = assignedContacts
        .map((name) => getSelectedAvatarTemplate(toAvatar(name)))
        .join("");
}

// Opens or closes a dropdown.
function toggleDropdown(id) {
    document.getElementById(id).classList.toggle("open");
    if (id === "category-dropdown") categoryTouched = true;
    checkCategoryOnClose();
}

// Closes every dropdown the click was outside of.
function closeDropdownOnOutsideClick(event) {
    document.querySelectorAll(".dropdown").forEach((dropdown) => {
        if (!dropdown.contains(event.target)) dropdown.classList.remove("open");
    });
    checkCategoryOnClose();
}

// Validates the category once its dropdown was opened and closed again.
function checkCategoryOnClose() {
    const dropdown = document.getElementById("category-dropdown");
    if (!dropdown || dropdown.classList.contains("open")) return;
    if (categoryTouched) validateField("category");
}

// Renders the category options and the selected category.
function renderCategories() {
    document.getElementById("category-list").innerHTML = CATEGORIES
        .map((category, i) => getCategoryOptionTemplate(category, i))
        .join("");
    document.getElementById("category-toggle").textContent =
        selectedCategory || "Select task category";
}

// Reads all values from the form.
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

// Validates the form and passes the data to the callback.
function handleSubmit(event) {
    event.preventDefault();
    if (!validateAll()) return;
    const task = getTaskFromForm();
    if (addTaskCallback) return addTaskCallback(task);
    showToast("Task added to board");
    event.target.reset();
}

// Resets the form after the clear button was clicked.
function handleReset() {
    resetAddTaskState();
    setTimeout(() => {
        initState();
        clearErrors();
        updateCreateButton();
    });
}

// Renders all parts of the form that come from JavaScript.
function initState() {
    renderPriorities();
    renderContacts();
    renderCategories();
    renderSubtasks();
    renderSelectedAvatars();
}

// Stops Enter from submitting the form.
function blockEnter(event) {
    if (event.key === "Enter") event.preventDefault();
}

// Adds the listeners for the add task form.
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

// Opens the date picker of the due date field.
function openDatePicker() {
    const input = document.getElementById("task-due-date");
    if (input.showPicker) {
        input.showPicker();
    } else {
        input.focus();
    }
}

// Shows a toast message for a short time.
function showToast(message) {
    removeToast();
    document.body.insertAdjacentHTML("beforeend", getToastTemplate(message));
    setTimeout(removeToast, 2200);
}

// Removes the toast if there is one.
function removeToast() {
    const toast = document.getElementById("toast");
    if (toast) toast.remove();
}

// Selects a category and closes the dropdown.
function selectCategory(index) {
    selectedCategory = CATEGORIES[index];
    renderCategories();
    document.getElementById("category-dropdown").classList.remove("open");
    updateCreateButton();
}

document.addEventListener("click", closeDropdownOnOutsideClick);

const AVATAR_COLORS = ["#ff7a00", "#1fd7c1", "#9327ff", "#ff70ff", "#ff4646", "#00bee8", "#6e52ff"];

// Builds initials and a fixed color from a name.
function toAvatar(name) {
    const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
    const sum = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return { name, initials, color: AVATAR_COLORS[sum % AVATAR_COLORS.length] };
}
