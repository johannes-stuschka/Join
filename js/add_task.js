const ICON_PATH = "../assets/icons/";

const PRIORITIES = [
    { key: "urgent", label: "Urgent", icon: ICON_PATH + "prio_urgent.svg" },
    { key: "medium", label: "Medium", icon: ICON_PATH + "prio_medium.svg" },
    { key: "low", label: "Low", icon: ICON_PATH + "prio_low.svg" },
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
let isSubmitting = false;
let originalDueDate = "";
const MAX_VISIBLE_AVATARS = 5;

const REQUIRED_FIELDS = {
    title: { inputId: "task-title", errorId: "title-error" },
    dueDate: { inputId: "task-due-date", errorId: "dueDate-error" },
    category: { inputId: "category-toggle", errorId: "category-error" },
};

/**
 * Sets up the add task form. Pass a task to fill the form for editing.
 *
 * @param {Function|null} [callback=null] - Called with the form values on submit.
 * @param {Object|null} [task=null] - A task to edit.
 */
function initAddTask(callback = null, task = null) {
    addTaskCallback = callback;
    document.addEventListener("click", closeDropdownOnOutsideClick);
    resetAddTaskState();
    setMinDueDate();
    if (task) fillForm(task);
    initState();
    addFormListeners();
    updateCreateButton();
}

/**
 * Fills the form with the data of a task.
 *
 * @param {Object} task - The task object.
 */
function fillForm(task) {
    document.getElementById("task-title").value = task.title;
    document.getElementById("task-description").value = task.description;
    document.getElementById("task-due-date").value = task.dueDate;
    originalDueDate = task.dueDate;
    selectedPriority = task.priority;
    selectedCategory = task.category;
    assignedContacts = task.assigned.map((user) => user.name);
    subtasks = task.subtasks.map((subtask) => subtask.text);
}

/**
 * Loads the contact names for the assigned-to dropdown.
 *
 * @returns {Promise<void>}
 */
async function loadTaskContacts() {
    const contacts = toList(await loadData("contacts"));
    CONTACTS = contacts.map((contact) => contact.name).sort((a, b) => a.localeCompare(b));
}

/**
 * Sets up the separate add task page.
 *
 * @returns {Promise<void>}
 */
async function initAddTaskPage() {
    if (!requireLogin()) return;
    renderLayout();
    document.getElementById("add-task-page").innerHTML = getAddTaskFormTemplate(true);
    initAddTask(saveNewTask);
    try {
        await loadTaskContacts();
    } catch (error) {
        console.error(error);
    }
    renderContacts();
}

/**
 * Saves a new task in "To do" and goes to the board.
 *
 * @param {Object} formTask - The values read from the add task form.
 * @returns {Promise<void>}
 */
async function saveNewTask(formTask) {
    await postData("tasks", toBoardTask(formTask, "todo"));
    showToast("Task added to board");
    setTimeout(() => (window.location.href = "board.html"), 2200);
}

/**
 * Turns form data into the task format the board uses.
 *
 * @param {Object} formTask - The values read from the add task form.
 * @param {string} status - The board column, e.g. "todo".
 * @returns {Object} The task for the board.
 */
function toBoardTask(formTask, status) {
    const { assignedTo, ...fields } = formTask;
    return {
        ...fields,
        status,
        subtasks: formTask.subtasks.map((text) => ({ text, done: false })),
        assigned: assignedTo.map(toAvatar),
    };
}

/**
 * Resets priority, category, contacts and subtasks.
 */
function resetAddTaskState() {
    selectedPriority = "medium";
    selectedCategory = "";
    assignedContacts = [];
    subtasks = [];
    categoryTouched = false;
    editingSubtask = -1;
    isSubmitting = false;
    originalDueDate = "";
}

/**
 * Returns today's date as "YYYY-MM-DD" in local time.
 *
 * @returns {string} The date as "YYYY-MM-DD".
 */
function getTodayIso() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Stops the date picker from offering days in the past.
 */
function setMinDueDate() {
    document.getElementById("task-due-date").min = getTodayIso();
}

/**
 * Renders the priority buttons.
 */
function renderPriorities() {
    document.getElementById("prio-buttons").innerHTML = PRIORITIES
        .map((prio) => getPrioButtonTemplate(prio, prio.key === selectedPriority))
        .join("");
}

/**
 * Selects a priority.
 *
 * @param {string} key - The priority key: "urgent", "medium" or "low".
 */
function selectPriority(key) {
    selectedPriority = key;
    renderPriorities();
}

/**
 * Renders the contacts in the assigned-to dropdown that match the search.
 */
function renderContacts() {
    const search = document.getElementById("assigned-toggle").value.trim().toLowerCase();
    const html = CONTACTS
        .map((contact, i) => ({ contact, i }))
        .filter(({ contact }) => contact.toLowerCase().includes(search))
        .map(({ contact, i }) => getContactOptionTemplate(contact, i, assignedContacts.includes(contact)))
        .join("");
    document.getElementById("assigned-list").innerHTML = html || getNoContactsTemplate();
}

/**
 * Opens the assigned-to dropdown and filters the contacts while typing.
 */
function searchContacts() {
    document.getElementById("assigned-dropdown").classList.add("open");
    renderContacts();
    scrollDropdownIntoView("assigned-dropdown");
}

/**
 * Scrolls an open dropdown list into view so all its rows are visible.
 *
 * @param {string} id - The id of the dropdown.
 */
function scrollDropdownIntoView(id) {
    const dropdown = document.getElementById(id);
    if (!dropdown.classList.contains("open")) return;
    dropdown.querySelector(".dropdown-list").scrollIntoView({ block: "nearest" });
}

/**
 * Assigns or unassigns a contact.
 *
 * @param {number} index - The position of the contact in CONTACTS.
 */
function toggleContact(index) {
    const contact = CONTACTS[index];
    if (assignedContacts.includes(contact)) {
        assignedContacts = assignedContacts.filter((c) => c !== contact);
    } else {
        assignedContacts.push(contact);
    }
    renderSelectedAvatars();
}

/**
 * Shows up to five avatars of the assigned contacts and a "+X" bubble for the rest.
 */
function renderSelectedAvatars() {
    const hidden = assignedContacts.length - MAX_VISIBLE_AVATARS;
    let html = assignedContacts
        .slice(0, MAX_VISIBLE_AVATARS)
        .map((name) => getSelectedAvatarTemplate(toAvatar(name)))
        .join("");
    if (hidden > 0) html += getMoreAvatarsTemplate(hidden);
    document.getElementById("selected-avatars").innerHTML = html;
}

/**
 * Opens or closes a dropdown.
 *
 * @param {string} id - The id of the dropdown.
 */
function toggleDropdown(id) {
    document.getElementById(id).classList.toggle("open");
    scrollDropdownIntoView(id);
    if (id === "category-dropdown") categoryTouched = true;
    checkCategoryOnClose();
}

/**
 * Closes every dropdown the click was outside of.
 *
 * @param {MouseEvent} event - The click event.
 */
function closeDropdownOnOutsideClick(event) {
    document.querySelectorAll(".dropdown").forEach((dropdown) => {
        if (!dropdown.contains(event.target)) dropdown.classList.remove("open");
    });
    if (!document.getElementById("assigned-dropdown")?.contains(event.target)) clearContactSearch();
    checkCategoryOnClose();
}

/**
 * Empties the contact search so all contacts show up again.
 */
function clearContactSearch() {
    const input = document.getElementById("assigned-toggle");
    if (!input || !input.value) return;
    input.value = "";
    renderContacts();
}

/**
 * Closes the assigned-to dropdown on Escape and keeps Enter from submitting.
 *
 * @param {KeyboardEvent} event - The keyboard event.
 */
function handleContactSearchKey(event) {
    if (event.key === "Enter") event.preventDefault();
    if (event.key !== "Escape") return;
    document.getElementById("assigned-dropdown").classList.remove("open");
    clearContactSearch();
}

/**
 * Validates the category once its dropdown was opened and closed again.
 */
function checkCategoryOnClose() {
    const dropdown = document.getElementById("category-dropdown");
    if (!dropdown || dropdown.classList.contains("open")) return;
    if (categoryTouched) validateField("category");
}

/**
 * Renders the category options and the selected category.
 */
function renderCategories() {
    document.getElementById("category-list").innerHTML = CATEGORIES
        .map((category, i) => getCategoryOptionTemplate(category, i))
        .join("");
    document.getElementById("category-toggle").textContent =
        selectedCategory || "Select task category";
}

/**
 * Reads all values from the form.
 *
 * @returns {Object} Title, description, due date, priority, assigned contacts, category and subtasks.
 */
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

/**
 * Validates the form and passes the data to the callback. The button stays disabled while saving.
 *
 * @param {SubmitEvent} event - The submit event of the form.
 * @returns {Promise<void>}
 */
async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting || !validateAll()) return;
    setSubmitting(true);
    const task = getTaskFromForm();
    if (!addTaskCallback) {
        showToast("Task added to board");
        return event.target.reset();
    }
    try {
        await addTaskCallback(task);
    } catch (error) {
        console.error(error);
        setSubmitting(false);
    }
}

/**
 * Locks or unlocks the submit button while a task is being saved.
 *
 * @param {boolean} value - True while the task is being saved.
 */
function setSubmitting(value) {
    isSubmitting = value;
    const button = document.getElementById("create-task-btn");
    if (button) button.disabled = value || !isFormValid();
}

/**
 * Resets the form after the clear button was clicked.
 */
function handleReset() {
    resetAddTaskState();
    setTimeout(() => {
        initState();
        clearErrors();
        updateCreateButton();
    });
}

/**
 * Renders all parts of the form that come from JavaScript.
 */
function initState() {
    renderPriorities();
    renderContacts();
    renderCategories();
    renderSubtasks();
    renderSelectedAvatars();
}

/**
 * Stops Enter from submitting the form.
 *
 * @param {KeyboardEvent} event - The keyboard event.
 */
function blockEnter(event) {
    if (event.key === "Enter") event.preventDefault();
}

/**
 * Adds the listeners for the add task form.
 */
function addFormListeners() {
    const form = document.getElementById("add-task-form");
    form.addEventListener("input", updateCreateButton);
    form.addEventListener("change", updateCreateButton);
    form.addEventListener("submit", handleSubmit);
    form.addEventListener("reset", handleReset);
    form.addEventListener("focusout", handleFocusOut);
    document.getElementById("task-title").addEventListener("keydown", blockEnter);
    document.getElementById("subtask-input").addEventListener("keydown", addSubtask);
    document.getElementById("assigned-toggle").addEventListener("click", searchContacts);
    document.getElementById("assigned-toggle").addEventListener("input", searchContacts);
    document.getElementById("assigned-toggle").addEventListener("keydown", handleContactSearchKey);
    document.getElementById("category-toggle").addEventListener("click", () => toggleDropdown("category-dropdown"));
}

/**
 * Opens the date picker of the due date field.
 */
function openDatePicker() {
    const input = document.getElementById("task-due-date");
    if (input.showPicker) {
        input.showPicker();
    } else {
        input.focus();
    }
}

/**
 * Shows a toast message for a short time.
 *
 * @param {string} message - The text to show.
 */
function showToast(message) {
    removeToast();
    document.body.insertAdjacentHTML("beforeend", getToastTemplate(message));
    setTimeout(removeToast, 2200);
}

/**
 * Removes the toast if there is one.
 */
function removeToast() {
    const toast = document.getElementById("toast");
    if (toast) toast.remove();
}

/**
 * Selects a category and closes the dropdown.
 *
 * @param {number} index - The position of the category in CATEGORIES.
 */
function selectCategory(index) {
    selectedCategory = CATEGORIES[index];
    renderCategories();
    document.getElementById("category-dropdown").classList.remove("open");
    updateCreateButton();
}

const AVATAR_COLORS = ["#ff7a00", "#1fd7c1", "#9327ff", "#ff70ff", "#ff4646", "#00bee8", "#6e52ff"];

/**
 * Builds initials and a fixed color from a name.
 *
 * @param {string} name - The full name of the contact.
 * @returns {{name: string, initials: string, color: string}} The avatar data.
 */
function toAvatar(name) {
    const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
    const sum = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return { name, initials, color: AVATAR_COLORS[sum % AVATAR_COLORS.length] };
}
