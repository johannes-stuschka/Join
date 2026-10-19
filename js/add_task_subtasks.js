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
