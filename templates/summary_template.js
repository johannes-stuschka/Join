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
 * Renders the greeting, with the name if there is one.
 *
 * @param {string} greeting - The greeting text.
 * @param {string|null} name - The user name, or null for the guest.
 * @returns {string} The HTML.
 */
function getGreetingTemplate(greeting, name) {
  if (!name) {
    return `<h1 class="summary-greeting">
      <span class="greeting-text greeting-guest">${greeting}</span>
    </h1>`;
  }
  return `<h1 class="summary-greeting">
    <span class="greeting-text">${greeting},</span>
    <span class="greeting-name">${escapeHtml(name)}</span>
  </h1>`;
}

/**
 * Renders a summary card.
 *
 * @param {Object} card - The card data from buildCard.
 * @returns {string} The HTML.
 */
function getSummaryCardTemplate(card) {
  return `<a class="summary-card ${card.cssClass}" href="${card.href}">
    <div class="card-top">
      <img class="card-icon" src="${card.icon}" alt="" />
      <span class="card-count">${card.count}</span>
    </div>
    <span class="card-label">${card.label}</span>
  </a>`;
}

/**
 * Renders the urgent card with the deadline.
 *
 * @param {Object} card - The card data from buildCard.
 * @param {string} deadline - The formatted deadline.
 * @returns {string} The HTML.
 */
function getUrgentCardTemplate(card, deadline) {
  return `<a class="summary-card card-urgent" href="${card.href}">
    <div class="urgent-left">
      <div class="card-top">
        <img class="card-icon" src="${card.icon}" alt="" />
        <span class="card-count">${card.count}</span>
      </div>
      <span class="card-label">${card.label}</span>
    </div>
    <div class="urgent-divider"></div>
    <div class="urgent-right">
      <span class="urgent-date">${deadline}</span>
      <span class="card-label">Upcoming Deadline</span>
    </div>
  </a>`;
}

/**
 * Puts greeting, urgent card and cards together.
 *
 * @param {string} greetingHtml - The greeting HTML.
 * @param {string} urgentHtml - The urgent card HTML.
 * @param {string} cardsHtml - The HTML of the other cards.
 * @returns {string} The HTML.
 */
function getSummaryTemplate(greetingHtml, urgentHtml, cardsHtml) {
  return `${greetingHtml}
  <div class="summary-grid">
    ${urgentHtml}
    ${cardsHtml}
  </div>`;
}