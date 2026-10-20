// Checks whether a required field is filled in.
function isFieldValid(name) {
    if (name === "title") return document.getElementById("task-title").value.trim() !== "";
    if (name === "dueDate") return document.getElementById("task-due-date").value !== "";
    return selectedCategory !== "";
}

// Checks every required field.
function isFormValid() {
    return Object.keys(REQUIRED_FIELDS).every((name) => isFieldValid(name));
}

// Checks a required field and shows or hides its error.
function validateField(name) {
    const field = REQUIRED_FIELDS[name];
    const valid = isFieldValid(name);
    document.getElementById(field.errorId).classList.toggle("active", !valid);
    document.getElementById(field.inputId).classList.toggle("invalid", !valid);
    return valid;
}

// Checks every required field and shows all errors.
function validateAll() {
    return Object.keys(REQUIRED_FIELDS).map((name) => validateField(name)).every(Boolean);
}

// Checks again the fields that currently show an error.
function refreshVisibleErrors() {
    Object.keys(REQUIRED_FIELDS).forEach((name) => {
        const error = document.getElementById(REQUIRED_FIELDS[name].errorId);
        if (error.classList.contains("active")) validateField(name);
    });
}

// Hides all errors in the form.
function clearErrors() {
    Object.values(REQUIRED_FIELDS).forEach(({ inputId, errorId }) => {
        document.getElementById(errorId).classList.remove("active");
        document.getElementById(inputId).classList.remove("invalid");
    });
}

// Validates title or due date when the user leaves the field.
function handleFocusOut(event) {
    const name = { "task-title": "title", "task-due-date": "dueDate" }[event.target.id];
    if (!name) return;
    const field = event.target.closest(".field");
    if (field && field.contains(event.relatedTarget)) return;
    validateField(name);
}

// Enables the create button only when all required fields are filled in.
function updateCreateButton() {
    document.getElementById("create-task-btn").disabled = !isFormValid();
    refreshVisibleErrors();
}
