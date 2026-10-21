/**
 * Renders the subtask list.
 */
function renderSubtasks() {
    document.getElementById("subtask-list").innerHTML = subtasks
        .map((text, i) => getSubtaskTemplate(text, i, i === editingSubtask))
        .join("");
}

/**
 * Switches a subtask into edit mode.
 *
 * @param {number} index - The position of the subtask in the list.
 */
function editSubtask(index) {
    editingSubtask = index;
    renderSubtasks();
    const input = document.getElementById("subtask-edit");
    input.value = subtasks[index];
    input.focus();
}

/**
 * Saves the edited text. An empty text keeps the old one.
 *
 * @param {number} index - The position of the subtask in the list.
 * @param {string} value - The new text.
 */
function saveSubtask(index, value) {
    if (editingSubtask !== index) return;
    const text = value.trim();
    editingSubtask = -1;
    if (text) subtasks[index] = text;
    renderSubtasks();
}

/**
 * Saves the subtask that is being edited.
 *
 * @param {number} index - The position of the subtask in the list.
 */
function confirmSubtaskEdit(index) {
    saveSubtask(index, document.getElementById("subtask-edit").value);
}

/**
 * Leaves edit mode without saving.
 */
function cancelSubtaskEdit() {
    editingSubtask = -1;
    renderSubtasks();
}

/**
 * Saves on Enter, cancels on Escape.
 *
 * @param {KeyboardEvent} event - The keyboard event.
 * @param {number} index - The position of the subtask in the list.
 */
function handleSubtaskEditKey(event, index) {
    if (event.key === "Enter") {
        event.preventDefault();
        confirmSubtaskEdit(index);
    }
    if (event.key === "Escape") cancelSubtaskEdit();
}

/**
 * Adds the subtask on Enter without submitting the form, clears the field on Escape.
 *
 * @param {KeyboardEvent} event - The keyboard event.
 */
function addSubtask(event) {
    if (event.key === "Escape") return clearSubtaskInput();
    if (event.key !== "Enter") return;
    event.preventDefault();
    confirmNewSubtask();
}

/**
 * Adds the text of the subtask field as a new subtask.
 */
function confirmNewSubtask() {
    const input = document.getElementById("subtask-input");
    const text = input.value.trim();
    if (!text) return;
    subtasks.push(text);
    input.value = "";
    renderSubtasks();
    input.focus();
    const list = document.getElementById("subtask-list");
    list.scrollTop = list.scrollHeight;
}

/**
 * Empties the subtask field.
 */
function clearSubtaskInput() {
    const input = document.getElementById("subtask-input");
    input.value = "";
    input.focus();
}

/**
 * Deletes a subtask.
 *
 * @param {number} index - The position of the subtask in the list.
 */
function deleteSubtask(index) {
    subtasks.splice(index, 1);
    editingSubtask = -1;
    renderSubtasks();
}
