function getBoardTemplate() {
    return `
    <div class="board-toolbar">
      <div class="board-search">
        <input id="board-search" type="text" placeholder="Find Task" />
        <span class="board-search-divider"></span>
        <button type="button" class="board-search-btn" aria-label="Search">${getSearchIcon()}</button>
      </div>
      <button type="button" class="btn-add-task" onclick="openAddTask()">Add task +</button>
    </div>
    <div class="board-columns" id="board-columns"></div>
    <div class="task-overlay" id="task-overlay" onclick="closeAddTaskOnBackdrop(event)"></div>`;
}

function getSearchIcon() {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>`;
}

function getColumnTemplate(column, cardsHtml) {
    return `
    <section class="board-column" ondragover="allowDrop(event)"
      ondragleave="leaveDrop(event)" ondrop="dropTask(event, '${column.status}')">
      <div class="column-head">
        <h2>${column.title}</h2>
        ${getColumnAddButton(column)}
      </div>
      <div class="column-body">${cardsHtml}</div>
    </section>`;
}

function getColumnAddButton(column) {
    if (column.status === "done") return "";
    return `<button type="button" class="btn-column-add" aria-label="Add task"
    onclick="openAddTask('${column.status}')">+</button>`;
}

function getEmptyTemplate(title) {
    return `<div class="no-tasks">No tasks ${title}</div>`;
}

function getCardTemplate(task) {
    return `
    <article class="task-card" draggable="true" onclick="openTaskDetail(${task.id})"
      ondragstart="startDrag(event, ${task.id})" ondragend="endDrag(event)">
      <span class="task-category ${getCategoryClass(task.category)}">${task.category}</span>
      <h3 class="task-title">${escapeHtml(task.title)}</h3>
      <p class="task-desc">${escapeHtml(task.description)}</p>
      ${getProgressTemplate(task.subtasks)}
      <div class="task-footer">
        <div class="task-avatars">${getAvatarsTemplate(task.assigned)}</div>
        <img class="task-priority" src="../assets/icons/prio_${task.priority}.svg" alt="${task.priority}" />
      </div>
    </article>`;
}

function getCategoryClass(category) {
    return category === "User Story" ? "cat-user" : "cat-tech";
}

function getProgressTemplate(subtasks) {
    if (!subtasks.length) return "";
    const done = subtasks.filter((s) => s.done).length;
    const percent = (done / subtasks.length) * 100;
    return `
    <div class="task-progress">
      <div class="progress-bar"><div class="progress-fill" style="width:${percent}%"></div></div>
      <span>${done}/${subtasks.length} Subtasks</span>
    </div>`;
}

function getAvatarsTemplate(assigned) {
    return assigned
        .map((u) => `<span class="avatar" style="background:${u.color}">${u.initials}</span>`)
        .join("");
}

function getAddTaskOverlayTemplate() {
    return `
    <div class="task-panel">
      <button type="button" class="panel-close" onclick="closeAddTask()" aria-label="Close">✕</button>
      <h1 class="panel-title">Add Task</h1>
      ${getAddTaskFormTemplate(false)}
    </div>`;
}

function getTaskDetailTemplate(task) {
    return `
    <div class="detail-panel">
      ${getDetailHeaderTemplate(task)}
      <p class="detail-desc">${escapeHtml(task.description)}</p>
      ${getDetailRowsTemplate(task)}
      ${getDetailAssignedTemplate(task.assigned)}
      ${getDetailSubtasksTemplate(task)}
      ${getDetailActionsTemplate(task.id)}
    </div>`;
}

function getDetailHeaderTemplate(task) {
    return `
    <div class="detail-top">
      <span class="task-category ${getCategoryClass(task.category)}">${task.category}</span>
      <button type="button" class="panel-close" onclick="closeAddTask()" aria-label="Close">✕</button>
    </div>
    <h1 class="detail-title">${escapeHtml(task.title)}</h1>`;
}

function getDetailRowsTemplate(task) {
    const prio = PRIORITIES.find((p) => p.key === task.priority);
    return `
    <div class="detail-row">
      <span class="detail-label">Due date:</span><span>${formatDate(task.dueDate)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Priority:</span>
      <span class="detail-prio">${prio.label}<img src="${prio.icon}" alt="" /></span>
    </div>`;
}

function getDetailAssignedTemplate(assigned) {
    if (!assigned.length) return "";
    return `
    <div class="detail-section">
      <span class="detail-label">Assigned To:</span>
      <ul class="detail-list">${assigned.map(getDetailContactTemplate).join("")}</ul>
    </div>`;
}

function getDetailContactTemplate(user) {
    return `<li class="detail-contact">
    <span class="avatar" style="background:${user.color}">${user.initials}</span>
    ${escapeHtml(user.name)}
  </li>`;
}

function getDetailSubtasksTemplate(task) {
    if (!task.subtasks.length) return "";
    const items = task.subtasks.map((s, i) => getDetailSubtaskTemplate(task.id, s, i));
    return `
    <div class="detail-section">
      <span class="detail-label">Subtasks</span>
      <ul class="detail-list">${items.join("")}</ul>
    </div>`;
}

function getDetailSubtaskTemplate(taskId, subtask, index) {
  return `<li class="detail-subtask"><label>
    <input type="checkbox" ${subtask.done ? "checked" : ""}
      onchange="toggleSubtask(${taskId}, ${index})" />
    <span class="check-icon"></span>
    ${escapeHtml(subtask.text)}
  </label></li>`;
}

function getDetailActionsTemplate(id) {
  return `
    <div class="detail-actions">
      <button type="button" onclick="deleteTask(${id})"><span class="detail-icon icon-delete"></span> Delete</button>
      <span class="detail-divider"></span>
      <button type="button" onclick="editTask(${id})"><span class="detail-icon icon-edit"></span> Edit</button>
    </div>`;
}

function getEditTaskTemplate() {
    return `
    <div class="edit-panel">
      <button type="button" class="panel-close" onclick="closeAddTask()" aria-label="Close">✕</button>
      ${getAddTaskFormTemplate(false, "Ok")}
    </div>`;
}
