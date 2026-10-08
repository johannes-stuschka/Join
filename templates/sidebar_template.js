function getSidebarButtonTemplate(button) {
  return `
    <a class="sidebar-btn ${button.activeClass}" href="${button.href}">
      <img src="${button.icon}" alt="" width="24" height="24" />
      <span>${button.label}</span>
    </a>`;
}