const SIDEBAR_BUTTONS = [
  { label: "Summary", href: "/pages/summary.html", icon: "/assets/icons/summary_icon.svg" },
  { label: "Add Task", href: "/pages/add_task.html", icon: "/assets/icons/add_task_icon.svg" },
  { label: "Board", href: "/pages/board.html", icon: "/assets/icons/board_icon.svg" },
  { label: "Contacts", href: "/pages/contacts.html", icon: "/assets/icons/contacts_icon.svg" },
];

function isCurrentPage(href) {
  return window.location.pathname.endsWith(href);
}

function renderSidebar() {
  const nav = document.getElementById("sidebar-nav");
  nav.innerHTML = SIDEBAR_BUTTONS.map((button) =>
    getSidebarButtonTemplate({
      ...button,
      activeClass: isCurrentPage(button.href) ? "active" : "",
    })
  ).join("");
}

renderSidebar();