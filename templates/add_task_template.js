function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function getPrioButtonTemplate(prio, isActive) {
  return `<button type="button" class="prio-btn prio-${prio.key} ${isActive ? "active" : ""}"
    onclick="selectPriority('${prio.key}')">
    ${prio.label}
    <img src="${prio.icon}" alt="" />
  </button>`;
}

function getContactOptionTemplate(contact, index, isChecked) {
  return `<li class="dropdown-item">
    <label>
      <input type="checkbox" ${isChecked ? "checked" : ""} onchange="toggleContact(${index})" />
      ${escapeHtml(contact)}
    </label>
  </li>`;
}

function getCategoryOptionTemplate(category, index) {
  return `<li class="dropdown-option" onclick="selectCategory(${index})">
    ${escapeHtml(category)}
  </li>`;
}

function getSubtaskTemplate(text, index) {
  return `<li class="subtask-item">
    <span>${escapeHtml(text)}</span>
    <button type="button" class="subtask-delete" onclick="deleteSubtask(${index})" aria-label="Delete subtask">✕</button>
  </li>`;
}