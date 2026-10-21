/**
 * Renders the header.
 *
 * @param {string} basePath - The path to the project root.
 * @returns {string} The HTML.
 */
function getHeaderTemplate(basePath) {
  return `
    <header class="header">
      <img class="header-logo" src="${basePath}assets/icons/join_icon.svg" alt="" />
      <div class="header-nav">
        <span class="header-title">Kanban Project Management Tool</span>
        <a href="${basePath}pages/help.html" class="header-help">
          <img src="${basePath}assets/icons/help_icon.svg" alt="Help" />
        </a>
        <div class="header-user-wrap">
          <button class="header-user" id="headerUser" aria-label="User menu" aria-haspopup="true" aria-expanded="false" aria-controls="headerMenu"></button>
          <nav class="header-menu" id="headerMenu" aria-label="User menu" hidden>
            <ul class="header-menu-list">
              <li class="header-menu-mobile"><a class="header-menu-item" href="${basePath}pages/help.html">Help</a></li>
              <li><a class="header-menu-item" href="${basePath}pages/legal.html">Legal Notice</a></li>
              <li><a class="header-menu-item" href="${basePath}pages/privacy.html">Privacy Policy</a></li>
              <li><button class="header-menu-item" id="headerLogout" type="button">Log out</button></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>`;
}
