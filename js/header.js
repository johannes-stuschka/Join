function getHeaderElements() {
  return {
    wrap: document.querySelector(".header-user-wrap"),
    button: document.getElementById("headerUser"),
    menu: document.getElementById("headerMenu"),
  };
}


function getInitials(user) {
  if (user.isGuest) return "G";
  const words = String(user.name || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  const last = words.length > 1 ? words[words.length - 1] : "";
  return (words[0][0] + (last ? last[0] : "")).toUpperCase();
}


function setMenuOpen(open) {
  const { button, menu } = getHeaderElements();
  menu.hidden = !open;
  button.setAttribute("aria-expanded", String(open));
}


function isMenuOpen() {
  return !getHeaderElements().menu.hidden;
}


function onHeaderDocumentClick(event) {
  const { wrap } = getHeaderElements();
  if (isMenuOpen() && !wrap.contains(event.target)) setMenuOpen(false);
}


function onHeaderKeydown(event) {
  if (event.key !== "Escape" || !isMenuOpen()) return;
  setMenuOpen(false);
  getHeaderElements().button.focus();
}


function bindHeaderEvents() {
  const { button } = getHeaderElements();
  button.addEventListener("click", () => setMenuOpen(!isMenuOpen()));
  document.getElementById("headerLogout").addEventListener("click", logout);
  document.addEventListener("click", onHeaderDocumentClick);
  document.addEventListener("keydown", onHeaderKeydown);
}


function initHeader() {
  const { wrap, button } = getHeaderElements();
  if (!wrap) return;
  const user = getCurrentUser();
  if (!user) {
    wrap.hidden = true;
    return;
  }
  button.textContent = getInitials(user);
  bindHeaderEvents();
}


document.addEventListener("templatesLoaded", initHeader);
