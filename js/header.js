const BASE_PATH = window.location.pathname.includes("/pages/") ? "../" : "./";


/**
 * Collects the header elements the menu needs.
 *
 * @returns {{wrap: HTMLElement, button: HTMLButtonElement, menu: HTMLElement}} The elements.
 */
function getHeaderElements() {
  return {
    wrap: document.querySelector(".header-user-wrap"),
    button: document.getElementById("headerUser"),
    menu: document.getElementById("headerMenu"),
  };
}


/**
 * Returns the initials for the header button, or "G" for the guest.
 *
 * @param {{name: string, isGuest: boolean}} user - The logged-in user.
 * @returns {string} The initials.
 */
function getInitials(user) {
  if (user.isGuest) return "G";
  const words = String(user.name || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  const last = words.length > 1 ? words[words.length - 1] : "";
  return (words[0][0] + (last ? last[0] : "")).toUpperCase();
}


/**
 * Opens or closes the user menu.
 *
 * @param {boolean} open - True to open the menu.
 */
function setMenuOpen(open) {
  const { button, menu } = getHeaderElements();
  menu.hidden = !open;
  button.setAttribute("aria-expanded", String(open));
}


/**
 * Checks whether the user menu is open.
 *
 * @returns {boolean} True if the menu is open.
 */
function isMenuOpen() {
  return !getHeaderElements().menu.hidden;
}


/**
 * Closes the user menu when the user clicks somewhere else.
 *
 * @param {MouseEvent} event - The click event.
 */
function onHeaderDocumentClick(event) {
  const { wrap } = getHeaderElements();
  if (isMenuOpen() && !wrap.contains(event.target)) setMenuOpen(false);
}


/**
 * Closes the user menu on Escape.
 *
 * @param {KeyboardEvent} event - The keyboard event.
 */
function onHeaderKeydown(event) {
  if (event.key !== "Escape" || !isMenuOpen()) return;
  setMenuOpen(false);
  getHeaderElements().button.focus();
}


/**
 * Adds the listeners for the user menu and logout.
 */
function bindHeaderEvents() {
  const { button } = getHeaderElements();
  button.addEventListener("click", () => setMenuOpen(!isMenuOpen()));
  document.getElementById("headerLogout").addEventListener("click", logout);
  document.addEventListener("click", onHeaderDocumentClick);
  document.addEventListener("keydown", onHeaderKeydown);
  window.addEventListener("pageshow", () => setMenuOpen(false));
}


/**
 * Shows the user's initials, or hides help and user area when nobody is logged in.
 */
function initHeader() {
  const { wrap, button } = getHeaderElements();
  if (!wrap) return;
  const user = getCurrentUser();
  if (!user) {
    wrap.hidden = true;
    document.querySelector(".header-nav").classList.add("header-nav-logged-out");
    return;
  }
  button.textContent = getInitials(user);
  bindHeaderEvents();
}


/**
 * Renders the header and sets it up.
 */
function renderHeader() {
  document.getElementById("header").innerHTML = getHeaderTemplate(BASE_PATH);
  initHeader();
}
