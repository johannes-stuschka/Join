const BASE_PATH = window.location.pathname.includes("/pages/") ? "../" : "./";


async function includeTemplate(element) {
  const response = await fetch(element.dataset.include);
  element.innerHTML = await response.text();
}


async function includeAllTemplates() {
  const elements = document.querySelectorAll("[data-include]");
  await Promise.all([...elements].map(includeTemplate));
  document.dispatchEvent(new Event("templatesLoaded"));
}


includeAllTemplates();
