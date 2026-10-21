/**
 * Renders the search bar, the column container and the overlay.
 *
 * @returns {string} The HTML.
 */
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

/**
 * Returns the search icon.
 *
 * @returns {string} The SVG markup.
 */
function getSearchIcon() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>`;
}

/**
 * Renders a column with its cards.
 *
 * @param {{status: string, title: string}} column - The column.
 * @param {string} cardsHtml - The HTML of the cards.
 * @returns {string} The HTML.
 */
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

/**
 * Renders the plus button of a column. Done has none.
 *
 * @param {{status: string, title: string}} column - The column.
 * @returns {string} The HTML.
 */
function getColumnAddButton(column) {
  if (column.status === "done") return "";
  return `<button type="button" class="btn-column-add" aria-label="Add task"
    onclick="openAddTask('${column.status}')"><img src="../assets/icons/add.svg" alt="" /></button>`;
}

/**
 * Renders the hint for an empty column.
 *
 * @param {string} title - The column title.
 * @returns {string} The HTML.
 */
function getEmptyTemplate(title) {
  return `<div class="no-tasks">No tasks ${title}</div>`;
}

/**
 * Renders a task card.
 *
 * @param {Object} task - The task object.
 * @returns {string} The HTML.
 */
function getCardTemplate(task) {
  return `
    <article class="task-card" draggable="true" onclick="openTaskDetail('${task.id}')"
      ondragstart="startDrag(event, '${task.id}')" ondragend="endDrag(event)">
      <div class="task-card-top">
        <span class="task-category ${getCategoryClass(task.category)}">${task.category}</span>
        <button type="button" class="btn-move" aria-label="Move task"
          onclick="toggleMoveMenu(event, '${task.id}')"><img src="../assets/icons/move.svg" alt="" /></button>
      </div>
      ${getMoveMenuTemplate(task)}
      <h3 class="task-title">${escapeHtml(task.title)}</h3>
      <p class="task-desc">${escapeHtml(shortenText(task.description, 60))}</p>
      ${getProgressTemplate(task.subtasks)}
      <div class="task-footer">
        <div class="task-avatars">${getAvatarsTemplate(task.assigned)}</div>
        <img class="task-priority" src="../assets/icons/prio_${task.priority}.svg" alt="${task.priority}" />
      </div>
    </article>`;
}

/**
 * Cuts a text after the given length and adds "...".
 *
 * @param {string} text - The text.
 * @param {number} maxLength - The maximum number of characters.
 * @returns {string} The shortened text.
 */
function shortenText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

/**
 * Returns the CSS class for the category label.
 *
 * @param {string} category - The category name.
 * @returns {string} The CSS class.
 */
function getCategoryClass(category) {
  return category === "User Story" ? "cat-user" : "cat-tech";
}

/**
 * Renders the subtask progress bar, or nothing without subtasks.
 *
 * @param {{text: string, done: boolean}[]} subtasks - The subtasks of the task.
 * @returns {string} The HTML.
 */
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

/**
 * Renders up to four avatars of the assigned contacts and a "+X" bubble for the rest.
 *
 * @param {Object[]} assigned - The assigned contacts with initials and color.
 * @returns {string} The HTML.
 */
function getAvatarsTemplate(assigned) {
  const hidden = assigned.length - MAX_CARD_AVATARS;
  let html = assigned
    .slice(0, MAX_CARD_AVATARS)
    .map((u) => `<span class="avatar" style="background:${u.color}">${u.initials}</span>`)
    .join("");
  if (hidden > 0) html += `<span class="avatar avatar-more">+${hidden}</span>`;
  return html;
}

/**
 * Renders the add task form inside the overlay.
 *
 * @returns {string} The HTML.
 */
function getAddTaskOverlayTemplate() {
  return `
    <div class="task-panel">
      <button type="button" class="panel-close" onclick="closeAddTask()" aria-label="Close"><img src="../assets/icons/exit.svg" alt="" /></button>
      <h1 class="panel-title">Add Task</h1>
      ${getAddTaskFormTemplate(false)}
    </div>`;
}

/**
 * Renders the detail view of a task.
 *
 * @param {Object} task - The task object.
 * @returns {string} The HTML.
 */
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

/**
 * Renders category, close button and title of the detail view.
 *
 * @param {Object} task - The task object.
 * @returns {string} The HTML.
 */
function getDetailHeaderTemplate(task) {
  return `
    <div class="detail-top">
      <span class="task-category ${getCategoryClass(task.category)}">${task.category}</span>
      <button type="button" class="panel-close" onclick="closeAddTask()" aria-label="Close"><img src="../assets/icons/exit.svg" alt="" /></button>
    </div>
    <h1 class="detail-title">${escapeHtml(task.title)}</h1>`;
}

/**
 * Renders due date and priority in the detail view.
 *
 * @param {Object} task - The task object.
 * @returns {string} The HTML.
 */
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

/**
 * Renders the assigned contacts in the detail view.
 *
 * @param {Object[]} assigned - The assigned contacts.
 * @returns {string} The HTML.
 */
function getDetailAssignedTemplate(assigned) {
  if (!assigned.length) return "";
  return `
    <div class="detail-section">
      <span class="detail-label">Assigned To:</span>
      <ul class="detail-list detail-assigned-list">${assigned.map(getDetailContactTemplate).join("")}</ul>
    </div>`;
}

/**
 * Renders one assigned contact in the detail view.
 *
 * @param {{name: string, initials: string, color: string}} user - The avatar data of the contact.
 * @returns {string} The HTML.
 */
function getDetailContactTemplate(user) {
  return `<li class="detail-contact">
    <span class="avatar avatar-large" style="background:${user.color}">${user.initials}</span>
    ${escapeHtml(user.name)}
  </li>`;
}

/**
 * Renders the subtask checklist in the detail view.
 *
 * @param {Object} task - The task object.
 * @returns {string} The HTML.
 */
function getDetailSubtasksTemplate(task) {
  if (!task.subtasks.length) return "";
  const items = task.subtasks.map((s, i) => getDetailSubtaskTemplate(task.id, s, i));
  return `
    <div class="detail-section">
      <span class="detail-label">Subtasks</span>
      <ul class="detail-list detail-subtask-list">${items.join("")}</ul>
    </div>`;
}

/**
 * Renders one subtask with checkbox.
 *
 * @param {string} taskId - The id of the task.
 * @param {{text: string, done: boolean}} subtask - The subtask.
 * @param {number} index - The position of the subtask in the list.
 * @returns {string} The HTML.
 */
function getDetailSubtaskTemplate(taskId, subtask, index) {
  return `<li class="detail-subtask"><label>
    <input type="checkbox" ${subtask.done ? "checked" : ""}
      onchange="toggleSubtask('${taskId}', ${index})" />
    <span class="check-icon"></span>
    ${escapeHtml(subtask.text)}
  </label></li>`;
}

/**
 * Renders the delete and edit buttons.
 *
 * @param {string} id - The id of the task.
 * @returns {string} The HTML.
 */
function getDetailActionsTemplate(id) {
  return `
    <div class="detail-actions">
      <button type="button" onclick="deleteTask('${id}')"><span class="detail-icon icon-delete"></span> Delete</button>
      <span class="detail-divider"></span>
      <button type="button" onclick="editTask('${id}')"><span class="detail-icon icon-edit"></span> Edit</button>
    </div>`;
}

/**
 * Renders the edit form inside the overlay.
 *
 * @returns {string} The HTML.
 */
function getEditTaskTemplate() {
  return `
    <div class="edit-panel">
      <button type="button" class="panel-close" onclick="closeAddTask()" aria-label="Close"><img src="../assets/icons/exit.svg" alt="" /></button>
      ${getAddTaskFormTemplate(false, "Ok")}
    </div>`;
}

/**
 * Renders the move menu with the previous and next column.
 *
 * @param {Object} task - The task object.
 * @returns {string} The HTML.
 */
function getMoveMenuTemplate(task) {
  const i = BOARD_COLUMNS.findIndex((c) => c.status === task.status);
  const prev = BOARD_COLUMNS[i - 1];
  const next = BOARD_COLUMNS[i + 1];
  return `
    <div class="move-menu" id="move-menu-${task.id}" onclick="event.stopPropagation()">
      <span class="move-menu-title">Move to</span>
      ${prev ? getMoveOptionTemplate(task.id, prev, "arrow_upward") : ""}
      ${next ? getMoveOptionTemplate(task.id, next, "arrow_downward") : ""}
    </div>`;
}

/**
 * Renders one option of the move menu.
 *
 * @param {string} id - The id of the task.
 * @param {{status: string, title: string}} column - The target column.
 * @param {string} icon - The icon file name without ".svg".
 * @returns {string} The HTML.
 */
function getMoveOptionTemplate(id, column, icon) {
  return `<button type="button" class="move-option"
      onclick="moveTask(event, '${id}', '${column.status}')">
      <img src="../assets/icons/${icon}.svg" alt="" />${column.title}
    </button>`;
}
