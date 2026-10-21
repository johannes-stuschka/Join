/**
 * Renders a sidebar link.
 *
 * @param {{label: string, href: string, icon: string, activeClass: string}} button - The link data.
 * @returns {string} The HTML.
 */
function getSidebarButtonTemplate(button) {
  return `
    <a class="sidebar-btn ${button.activeClass}" href="${button.href}">
      <span class="sidebar-icon" style="--icon: url('${button.icon}')" aria-hidden="true"></span>
      <span>${button.label}</span>
    </a>`;
}