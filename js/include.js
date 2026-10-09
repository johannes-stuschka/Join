const BASE_PATH = window.location.pathname.includes("/pages/") ? "../" : "./";

async function includeTemplate(element) {
  const response = await fetch(element.dataset.include);
  element.innerHTML = await response.text();
}

document.querySelectorAll("[data-include]").forEach(includeTemplate);
