/**
 * Escapes text so it can be put into HTML safely.
 *
 * @param {string} text - The text to escape.
 * @returns {string} The escaped text.
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Renders a priority button.
 *
 * @param {{key: string, label: string, icon: string}} prio - The priority.
 * @param {boolean} isActive - Whether it is selected.
 * @returns {string} The HTML.
 */
function getPrioButtonTemplate(prio, isActive) {
  return `<button type="button" class="prio-btn prio-${prio.key} ${isActive ? "active" : ""}"
    onclick="selectPriority('${prio.key}')">
    ${prio.label}
    <img src="${prio.icon}" alt="" />
  </button>`;
}

/**
 * Renders a contact with avatar and checkbox in the assigned-to dropdown.
 *
 * @param {string} contact - The name of the contact.
 * @param {number} index - The position in CONTACTS.
 * @param {boolean} isChecked - Whether it is assigned.
 * @returns {string} The HTML.
 */
function getContactOptionTemplate(contact, index, isChecked) {
  const user = toAvatar(contact);
  return `<li class="dropdown-item">
    <label class="contact-option">
      <span class="avatar avatar-large" style="background:${user.color}">${user.initials}</span>
      <span class="contact-option-name">${escapeHtml(contact)}</span>
      <input type="checkbox" ${isChecked ? "checked" : ""} onchange="toggleContact(${index})" />
      <span class="contact-check"></span>
    </label>
  </li>`;
}

/**
 * Renders the hint when no contact matches the search.
 *
 * @returns {string} The HTML.
 */
function getNoContactsTemplate() {
  return `<li class="dropdown-empty">No contacts found</li>`;
}

/**
 * Renders a category option.
 *
 * @param {string} category - The category name.
 * @param {number} index - The position in CATEGORIES.
 * @returns {string} The HTML.
 */
function getCategoryOptionTemplate(category, index) {
  return `<li class="dropdown-option" onclick="selectCategory(${index})">
    ${escapeHtml(category)}
  </li>`;
}

/**
 * Renders a subtask, or its edit field.
 *
 * @param {string} text - The subtask text.
 * @param {number} index - The position of the subtask in the list.
 * @param {boolean} isEditing - Whether it is in edit mode.
 * @returns {string} The HTML.
 */
function getSubtaskTemplate(text, index, isEditing) {
  if (isEditing) return getSubtaskEditTemplate(index);
  return `<li class="subtask-item">
    <span class="subtask-text">${escapeHtml(text)}</span>
    <span class="subtask-tools">
      <button type="button" class="subtask-btn" onclick="editSubtask(${index})" aria-label="Edit subtask"><span class="detail-icon icon-edit"></span></button>
      <span class="subtask-divider"></span>
      <button type="button" class="subtask-btn" onclick="deleteSubtask(${index})" aria-label="Delete subtask"><span class="detail-icon icon-delete"></span></button>
    </span>
  </li>`;
}

/**
 * Renders the edit field of a subtask.
 *
 * @param {number} index - The position of the subtask in the list.
 * @returns {string} The HTML.
 */
function getSubtaskEditTemplate(index) {
  return `<li class="subtask-item editing">
    <input class="subtask-edit-input" id="subtask-edit" type="text"
      onkeydown="handleSubtaskEditKey(event, ${index})" />
    <span class="subtask-tools">
      <button type="button" class="subtask-btn" onclick="deleteSubtask(${index})" aria-label="Delete subtask"><span class="detail-icon icon-delete"></span></button>
      <span class="subtask-divider"></span>
      <button type="button" class="subtask-btn" onclick="confirmSubtaskEdit(${index})" aria-label="Save">${getCheckIcon()}</button>
    </span>
  </li>`;
}

/**
 * Returns the X icon.
 *
 * @returns {string} The SVG markup.
 */
function getCrossIcon() {
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
}

/**
 * Returns the check icon.
 *
 * @returns {string} The SVG markup.
 */
function getCheckIcon() {
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5L20 7"/></svg>`;
}

/**
 * Renders the whole add task form.
 *
 * @param {boolean} withClear - Whether the clear button is shown.
 * @param {string} [submitLabel="Create Task"] - The text of the submit button.
 * @returns {string} The HTML.
 */
function getAddTaskFormTemplate(withClear, submitLabel = "Create Task") {
  return `<form class="add-task" id="add-task-form" novalidate>
    <div class="add-task-fields">
      ${getTitleDescriptionTemplate()}
      ${getDueDateTemplate()}
      ${getPriorityFieldTemplate()}
      ${getAssignedFieldTemplate()}
      ${getCategoryFieldTemplate()}
      ${getSubtaskFieldTemplate()}
    </div>
    ${getAddTaskActionsTemplate(withClear, submitLabel)}
  </form>`;
}

/**
 * Renders the title and description fields.
 *
 * @returns {string} The HTML.
 */
function getTitleDescriptionTemplate() {
  return `
    <div class="field">
      <textarea class="title-input" id="task-title" rows="1" maxlength="45" placeholder="Enter a title" required></textarea>
      ${getErrorTemplate("title-error")}
    </div>
    <label class="field">
      <span class="field-label">Description <span class="optional">(optional)</span></span>
      <textarea id="task-description" placeholder="Enter a Description"></textarea>
    </label>`;
}

/**
 * Renders the due date field.
 *
 * @returns {string} The HTML.
 */
function getDueDateTemplate() {
  return `
    <label class="field input-field">
      <span class="field-label">Due date</span>
      <div class="date-wrapper">
        <input class="line-input" id="task-due-date" type="date" max="9999-12-31" required />
        <button class="date-btn" type="button" onclick="openDatePicker()" aria-label="Open calendar">
          <img src="../assets/icons/calendar.svg" alt="Open calendar" />
        </button>
      </div>
      ${getErrorTemplate("dueDate-error")}
    </label>`;
}

/**
 * Renders the priority field.
 *
 * @returns {string} The HTML.
 */
function getPriorityFieldTemplate() {
  return `
    <div class="field">
      <span class="field-label">Priority</span>
      <div class="prio-buttons" id="prio-buttons"></div>
    </div>`;
}

/**
 * Renders the assigned-to dropdown.
 *
 * @returns {string} The HTML.
 */
function getAssignedFieldTemplate() {
  return `
    <div class="field">
      <span class="field-label">Assigned to <span class="optional">(optional)</span></span>
      <div class="dropdown" id="assigned-dropdown">
        <input class="dropdown-toggle" id="assigned-toggle" type="text" placeholder="Select contacts to assign" autocomplete="off" />
        <ul class="dropdown-list" id="assigned-list"></ul>
      </div>
      <div class="selected-avatars" id="selected-avatars"></div>
    </div>`;
}

/**
 * Renders the category dropdown.
 *
 * @returns {string} The HTML.
 */
function getCategoryFieldTemplate() {
  return `
    <div class="field category-field">
      <span class="field-label">Category</span>
      <div class="dropdown" id="category-dropdown">
        <button class="dropdown-toggle" id="category-toggle" type="button">Select task category</button>
        <ul class="dropdown-list" id="category-list"></ul>
      </div>
      ${getErrorTemplate("category-error")}
    </div>`;
}

/**
 * Renders a hidden error message below a field.
 *
 * @param {string} id - The id of the error element.
 * @param {string} [message="This field is required"] - The error text.
 * @returns {string} The HTML.
 */
function getErrorTemplate(id, message = "This field is required") {
  return `<span class="field-error" id="${id}">${message}</span>`;
}

/**
 * Renders the subtask input and list.
 *
 * @returns {string} The HTML.
 */
function getSubtaskFieldTemplate() {
  return `
    <div class="field">
      <span class="field-label">Subtasks <span class="optional">(optional)</span></span>
      <div class="subtask-input-wrapper">
        <input class="line-input" id="subtask-input" type="text" placeholder="Add new subtask" />
        <span class="subtask-tools subtask-input-tools">
          <button type="button" class="subtask-btn" onclick="clearSubtaskInput()" aria-label="Clear subtask">${getCrossIcon()}</button>
          <span class="subtask-divider"></span>
          <button type="button" class="subtask-btn" onclick="confirmNewSubtask()" aria-label="Add subtask">${getCheckIcon()}</button>
        </span>
      </div>
      <ul class="subtask-list" id="subtask-list"></ul>
    </div>`;
}

/**
 * Renders the clear and submit buttons.
 *
 * @param {boolean} withClear - Whether the clear button is shown.
 * @param {string} submitLabel - The text of the submit button.
 * @returns {string} The HTML.
 */
function getAddTaskActionsTemplate(withClear, submitLabel) {
  const clearBtn = withClear ? `<button class="btn btn-secondary" type="reset">Clear ✕</button>` : "";
  return `
    <div class="add-task-actions">
      ${clearBtn}
      <button class="btn btn-primary" id="create-task-btn" type="submit" disabled>${submitLabel} ✓</button>
    </div>`;
}

/**
 * Renders the avatar of an assigned contact.
 *
 * @param {{name: string, initials: string, color: string}} user - The avatar data of the contact.
 * @returns {string} The HTML.
 */
function getSelectedAvatarTemplate(user) {
  return `<span class="avatar avatar-large" style="background:${user.color}">${user.initials}</span>`;
}

/**
 * Renders the bubble that counts the hidden assigned contacts.
 *
 * @param {number} count - The number of hidden contacts.
 * @returns {string} The HTML.
 */
function getMoreAvatarsTemplate(count) {
  return `<span class="avatar avatar-large avatar-more">+${count}</span>`;
}

/**
 * Renders the toast.
 *
 * @param {string} message - The text to show.
 * @returns {string} The HTML.
 */
function getToastTemplate(message) {
  return `<div class="toast" id="toast">
    <span>${escapeHtml(message)}</span>
    <span class="toast-icon"></span>
  </div>`;
}
