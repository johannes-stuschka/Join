// Escapes text so it can be put into HTML safely.
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Renders the round avatar of a contact.
function getAvatarTemplate(contact, sizeClass = "") {
  return `<span class="avatar ${sizeClass}" style="--avatar-color: ${contact.color}">${getContactInitials(contact.name)}</span>`;
}

// Renders the letter heading of a group.
function getContactGroupTemplate(letter) {
  return `<li class="contact-group-letter">${escapeHtml(letter)}</li>`;
}

// Renders a contact in the list.
function getContactItemTemplate(contact, isActive) {
  return `<li>
    <button type="button" class="contact-item ${isActive ? "active" : ""}" onclick="toggleContactSelection('${contact.id}')">
      ${getAvatarTemplate(contact)}
      <span class="contact-item-text">
        <span class="contact-item-name">${escapeHtml(contact.name)}</span>
        <span class="contact-item-email">${escapeHtml(contact.email)}</span>
      </span>
    </button>
  </li>`;
}

// Renders the detail view of a contact.
function getContactDetailTemplate(contact) {
  return `<div class="contact-detail-content">
    <button type="button" class="contact-back" onclick="selectContact(null)" aria-label="Back to contact list">
      <img src="../assets/icons/arrow_left.svg" alt="" width="21" height="20" />
    </button>
    <div class="contact-detail-head">
      ${getAvatarTemplate(contact, "avatar-lg")}
      <div>
        <h1 class="contact-detail-name">${escapeHtml(contact.name)}</h1>
        <div class="contact-actions">
          <button type="button" class="contact-action" onclick="openEditContact('${contact.id}')">
            <span class="icon icon-edit"></span>Edit
          </button>
          <button type="button" class="contact-action" onclick="deleteContact('${contact.id}')">
            <span class="icon icon-delete"></span>Delete
          </button>
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

// Renders the avatar with a person icon shown when adding a contact.
function getAvatarPlaceholderTemplate() {
  return `<span class="avatar avatar-lg avatar-placeholder"><span class="icon icon-person"></span></span>`;
}
