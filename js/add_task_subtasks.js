// Renders the subtask list.
function renderSubtasks() {
    document.getElementById("subtask-list").innerHTML = subtasks
        .map((text, i) => getSubtaskTemplate(text, i, i === editingSubtask))
        .join("");
}

// Switches a subtask into edit mode.
function editSubtask(index) {
    editingSubtask = index;
    renderSubtasks();
    const input = document.getElementById("subtask-edit");
    input.value = subtasks[index];
    input.focus();
}

// Saves the edited text. An empty text keeps the old one.
function saveSubtask(index, value) {
    if (editingSubtask !== index) return;
    const text = value.trim();
    editingSubtask = -1;
    if (text) subtasks[index] = text;
    renderSubtasks();
}

// Saves the subtask that is being edited.
function confirmSubtaskEdit(index) {
    saveSubtask(index, document.getElementById("subtask-edit").value);
}

// Leaves edit mode without saving.
function cancelSubtaskEdit() {
    editingSubtask = -1;
    renderSubtasks();
}

// Saves on Enter, cancels on Escape.
function handleSubtaskEditKey(event, index) {
    if (event.key === "Enter") {
        event.preventDefault();
        confirmSubtaskEdit(index);
    }
    if (event.key === "Escape") cancelSubtaskEdit();
}

// Adds the subtask on Enter without submitting the form.
function addSubtask(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const input = event.target;
    const text = input.value.trim();
    if (!text) return;
    subtasks.push(text);
    input.value = "";
    renderSubtasks();
}

// Deletes a subtask.
function deleteSubtask(index) {
    subtasks.splice(index, 1);
    renderSubtasks();
}
