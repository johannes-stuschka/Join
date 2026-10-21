/**
 * Checks whether a required field is filled in.
 *
 * @param {string} name - The field name: "title", "dueDate" or "category".
 * @returns {boolean} True if the field is filled in correctly.
 */
function isFieldValid(name) {
    if (name === "title") return document.getElementById("task-title").value.trim() !== "";
    if (name === "dueDate") return isDueDateValid(document.getElementById("task-due-date").value);
    return selectedCategory !== "";
}

/**
 * Checks that the due date is a real date from today on. An edited task may keep its old date.
 *
 * @param {string} value - The date as "YYYY-MM-DD".
 * @returns {boolean} True if the date is allowed.
 */
function isDueDateValid(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    if (value === originalDueDate) return true;
    return value >= getTodayIso();
}

/**
 * Returns the error text for a field. A filled in but wrong date gets its own text.
 *
 * @param {string} name - The field name.
 * @returns {string} The error text.
 */
function getErrorMessage(name) {
    const date = document.getElementById("task-due-date").value;
    if (name === "dueDate" && date) return "Please choose today or a future date";
    return "This field is required";
}

/**
 * Checks every required field.
 *
 * @returns {boolean} True if the form is valid.
 */
function isFormValid() {
    return Object.keys(REQUIRED_FIELDS).every((name) => isFieldValid(name));
}

/**
 * Checks a required field and shows or hides its error.
 *
 * @param {string} name - The field name: "title", "dueDate" or "category".
 * @returns {boolean} True if the field is valid.
 */
function validateField(name) {
    const field = REQUIRED_FIELDS[name];
    const valid = isFieldValid(name);
    document.getElementById(field.errorId).classList.toggle("active", !valid);
    document.getElementById(field.inputId).classList.toggle("invalid", !valid);
    return valid;
}

/**
 * Checks every required field and shows all errors.
 *
 * @returns {boolean} True if all fields are valid.
 */
function validateAll() {
    return Object.keys(REQUIRED_FIELDS).map((name) => validateField(name)).every(Boolean);
}

/**
 * Checks again the fields that currently show an error.
 */
function refreshVisibleErrors() {
    Object.keys(REQUIRED_FIELDS).forEach((name) => {
        const error = document.getElementById(REQUIRED_FIELDS[name].errorId);
        if (error.classList.contains("active")) validateField(name);
    });
}

/**
 * Hides all errors in the form.
 */
function clearErrors() {
    Object.values(REQUIRED_FIELDS).forEach(({ inputId, errorId }) => {
        document.getElementById(errorId).classList.remove("active");
        document.getElementById(inputId).classList.remove("invalid");
    });
}

/**
 * Validates title or due date when the user leaves the field.
 *
 * @param {FocusEvent} event - The focusout event.
 */
function handleFocusOut(event) {
    const name = { "task-title": "title", "task-due-date": "dueDate" }[event.target.id];
    if (!name) return;
    const field = event.target.closest(".field");
    if (field && field.contains(event.relatedTarget)) return;
    validateField(name);
}

/**
 * Enables the create button only when all required fields are filled in.
 */
function updateCreateButton() {
    document.getElementById("create-task-btn").disabled = isSubmitting || !isFormValid();
    refreshVisibleErrors();
}
