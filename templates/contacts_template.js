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
 * Renders the round avatar of a contact.
 *
 * @param {Object} contact - The contact with name, email, phone and color.
 * @param {string} [sizeClass=""] - Extra CSS class for the size.
 * @returns {string} The HTML.
 */
function getAvatarTemplate(contact, sizeClass = "") {
  return `<span class="avatar ${sizeClass}" style="--avatar-color: ${contact.color}">${getContactInitials(contact.name)}</span>`;
}

/**
 * Renders the contact name and adds "(You)" for the logged-in user.
 *
 * @param {Object} contact - The contact with name, email, phone and color.
 * @returns {string} The HTML.
 */
function getContactNameTemplate(contact) {
  return escapeHtml(contact.name) + (isOwnContact(contact) ? " (You)" : "");
}

/**
 * Renders the letter heading of a group.
 *
 * @param {string} letter - The first letter.
 * @returns {string} The HTML.
 */
function getContactGroupTemplate(letter) {
  return `<li class="contact-group-letter">${escapeHtml(letter)}</li>`;
}

/**
 * Renders a contact in the list.
 *
 * @param {Object} contact - The contact with name, email, phone and color.
 * @param {boolean} isActive - Whether it is selected.
 * @returns {string} The HTML.
 */
function getContactItemTemplate(contact, isActive) {
  return `<li>
    <button type="button" class="contact-item ${isActive ? "active" : ""}" onclick="toggleContactSelection('${contact.id}')">
      ${getAvatarTemplate(contact)}
      <span class="contact-item-text">
        <span class="contact-item-name">${getContactNameTemplate(contact)}</span>
        <span class="contact-item-email">${escapeHtml(contact.email)}</span>
      </span>
    </button>
  </li>`;
}

/**
 * Renders the delete button of a contact.
 *
 * @param {Object} contact - The contact with name, email, phone and color.
 * @returns {string} The HTML.
 */
function getContactDeleteTemplate(contact) {
  return `<button type="button" class="contact-action" onclick="deleteContact('${contact.id}')">
            <span class="icon icon-delete"></span>Delete
          </button>`;
}

/**
 * Renders the detail view of a contact.
 *
 * @param {Object} contact - The contact with name, email, phone and color.
 * @returns {string} The HTML.
 */
function getContactDetailTemplate(contact) {
  return `<div class="contact-detail-content">
    <button type="button" class="contact-back" onclick="selectContact(null)" aria-label="Back to contact list">
      <img src="../assets/icons/arrow_left.svg" alt="" width="21" height="20" />
    </button>
    <div class="contact-detail-head">
      ${getAvatarTemplate(contact, "avatar-lg")}
      <div>
        <h1 class="contact-detail-name">${getContactNameTemplate(contact)}</h1>
        <div class="contact-actions">
          <button type="button" class="contact-action" onclick="openEditContact('${contact.id}')">
            <span class="icon icon-edit"></span>Edit
          </button>
          ${isProtectedContact(contact) ? "" : getContactDeleteTemplate(contact)}
        </div>
      </div>
    </div>
    <h2 class="contact-info-title">Contact Information</h2>
    <dl class="contact-info">
      <dt>Email</dt>
      <dd><a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></dd>
      <dt>Phone</dt>
      <dd>${escapeHtml(contact.phone)}</dd>
    </dl>
    <button type="button" class="contact-fab contact-options-btn" onclick="toggleContactOptions(event)" aria-label="Contact options">
      <span class="icon icon-lg icon-more"></span>
    </button>
  </div>`;
}

/**
 * Renders the avatar with a person icon shown when adding a contact.
 *
 * @returns {string} The HTML.
 */
function getAvatarPlaceholderTemplate() {
  return `<span class="avatar avatar-lg avatar-placeholder"><span class="icon icon-person"></span></span>`;
}
