// Escapes text so it can be put into HTML safely.
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Renders the greeting, with the name if there is one.
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

// Renders a summary card.
function getSummaryCardTemplate(card) {
  return `<a class="summary-card ${card.cssClass}" href="${card.href}">
    <div class="card-top">
      <img class="card-icon" src="${card.icon}" alt="" />
      <span class="card-count">${card.count}</span>
    </div>
    <span class="card-label">${card.label}</span>
  </a>`;
}

// Renders the urgent card with the deadline.
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

// Puts greeting, urgent card and cards together.
function getSummaryTemplate(greetingHtml, urgentHtml, cardsHtml) {
  return `${greetingHtml}
  <div class="summary-grid">
    ${urgentHtml}
    ${cardsHtml}
  </div>`;
}