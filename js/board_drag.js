function startDrag(event, id) {
  draggedTaskId = id;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", id);
  event.currentTarget.classList.add("dragging");
}

function endDrag(event) {
  event.currentTarget.classList.remove("dragging");
}

function allowDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.add("drag-over");
}

function leaveDrop(event) {
  if (event.currentTarget.contains(event.relatedTarget)) return;
  event.currentTarget.classList.remove("drag-over");
}

async function dropTask(event, status) {
  event.preventDefault();
  const task = getTaskById(draggedTaskId);
  draggedTaskId = null;
  if (!task || task.status === status) return renderColumns();
  task.status = status;
  renderColumns();
  await patchData(`tasks/${task.id}`, { status });
}

function toggleMoveMenu(event, id) {
  event.stopPropagation();
  const menu = document.getElementById(`move-menu-${id}`);
  const wasOpen = menu.classList.contains("open");
  closeMoveMenus();
  menu.classList.toggle("open", !wasOpen);
}

function closeMoveMenus() {
  document.querySelectorAll(".move-menu.open").forEach((menu) => menu.classList.remove("open"));
}

function closeMoveMenuOnOutsideClick(event) {
  if (!document.querySelector(".move-menu.open")) return;
  if (event.target.closest(".move-menu, .btn-move")) return;
  event.stopPropagation();
  closeMoveMenus();
}

async function moveTask(event, id, status) {
  event.stopPropagation();
  const task = getTaskById(id);
  if (!task || task.status === status) return closeMoveMenus();
  task.status = status;
  renderColumns();
  await patchData(`tasks/${id}`, { status });
}

document.addEventListener("click", closeMoveMenuOnOutsideClick, true);
