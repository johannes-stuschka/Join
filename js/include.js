async function includeTemplate(id, file) {
  const response = await fetch(file);
  document.getElementById(id).innerHTML = await response.text();
}

includeTemplate("header", "./templates/header.html");
