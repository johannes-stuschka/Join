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
