const SIDEBAR_BUTTONS = [
  { label: "Summary", href: "pages/summary.html", icon: "assets/icons/summary_icon.svg" },
  { label: "Add Task", href: "pages/add_task.html", icon: "assets/icons/add_task_icon.svg" },
  { label: "Board", href: "pages/board.html", icon: "assets/icons/board_icon.svg" },
  { label: "Contacts", href: "pages/contacts.html", icon: "assets/icons/contacts_icon.svg" },
];

const LOGIN_BUTTON = {
  label: "Log In",
  href: "index.html",
  icon: "assets/icons/login_icon.svg",
};

/**
 * Checks whether a link points to the open page.
 *
 * @param {string} href - The link target.
 * @returns {boolean} True if it is the current page.
 */
function isCurrentPage(href) {
  return window.location.pathname.endsWith(href);
}

/**
 * Renders the sidebar links and highlights the current page.
 */
function renderSidebar() {
  const nav = document.getElementById("sidebar-nav");
  const buttons = getCurrentUser() ? SIDEBAR_BUTTONS : [LOGIN_BUTTON];
  nav.innerHTML = buttons.map((button) =>
    getSidebarButtonTemplate({
      ...button,
      href: BASE_PATH + button.href,
      icon: BASE_PATH + button.icon,
      activeClass: isCurrentPage(button.href) ? "active" : "",
    }),
  ).join("");
}

/**
 * Renders header and sidebar of a page.
 */
function renderLayout() {
  renderHeader();
  renderSidebar();
}
