const BOARD_COLUMNS = [
  { status: "todo", title: "To do" },
  { status: "progress", title: "In progress" },
  { status: "feedback", title: "Await feedback" },
  { status: "done", title: "Done" },
];

const DEFAULT_TASKS = [
  {
    status: "todo",
    category: "User Story",
    priority: "medium",
    title: "Kochwelt Page & Recipe Recommender",
    description: "Build start page with recipe recommendation.",
    dueDate: "2026-11-05",
    subtasks: [
      { text: "Implement Recipe Recommendation", done: true },
      { text: "Start Page Layout", done: false },
    ],
    assigned: [
      { name: "Lukas Neumann", initials: "LN", color: "#1fd7c1" },
      { name: "Nora Krause", initials: "NK", color: "#462f8a" },
      { name: "Lena Hoffmann", initials: "LH", color: "#ff7a00" },
    ],
  },
  {
    status: "progress",
    category: "Technical Task",
    priority: "urgent",
    title: "CSS Architecture Planning",
    description: "Define CSS naming conventions and structure.",
    dueDate: "2026-10-24",
    subtasks: [
      { text: "Define naming conventions", done: true },
      { text: "Document structure", done: false },
    ],
    assigned: [
      { name: "Jonas Becker", initials: "JB", color: "#9327ff" },
      { name: "Mia Schneider", initials: "MS", color: "#6e52ff" },
    ],
  },
  {
    status: "progress",
    category: "User Story",
    priority: "low",
    title: "Contact Form & Imprint",
    description: "Create a contact form and imprint page.",
    dueDate: "2026-11-12",
    subtasks: [
      { text: "Contact form validation", done: false },
      { text: "Imprint text", done: false },
    ],
    assigned: [
      { name: "Felix Wagner", initials: "FW", color: "#fc71ff" },
      { name: "Clara Richter", initials: "CR", color: "#ffbb2b" },
    ],
  },
  {
    status: "feedback",
    category: "Technical Task",
    priority: "medium",
    title: "HTML Base Template Creation",
    description: "Create reusable HTML base templates.",
    dueDate: "2026-10-30",
    subtasks: [],
    assigned: [
      { name: "Paul Schäfer", initials: "PS", color: "#ff4646" },
      { name: "Lena Hoffmann", initials: "LH", color: "#ff7a00" },
    ],
  },
  {
    status: "done",
    category: "User Story",
    priority: "urgent",
    title: "Daily Kochwelt Recipe",
    description: "Implement daily recipe and portion calculator.",
    dueDate: "2026-10-20",
    subtasks: [
      { text: "Daily recipe", done: true },
      { text: "Portion calculator", done: true },
    ],
    assigned: [
      { name: "Clara Richter", initials: "CR", color: "#ffbb2b" },
      { name: "Nora Krause", initials: "NK", color: "#462f8a" },
    ],
  },
];

let boardTasks = [];
let draggedTaskId = null;

async function initBoard() {
  document.getElementById("board").innerHTML = getBoardTemplate();
  document.getElementById("board-search").addEventListener("input", renderColumns);
  try {
    await Promise.all([loadTasks(), loadTaskContacts()]);
  } catch (error) {
    console.error(error);
  }
  renderColumns();
}

async function seedTasks() {
  for (const task of DEFAULT_TASKS) {
    await postData("tasks", task);
  }
  return await loadData("tasks");
}

async function loadTasks() {
  let data = await loadData("tasks");
  if (!data) data = await seedTasks();
  boardTasks = toList(data).map(normalizeTask);
}

function normalizeTask(task) {
  return { ...task, description: task.description || "", subtasks: task.subtasks || [], assigned: task.assigned || [] };
}

function getTaskById(id) {
  return boardTasks.find((t) => t.id === id);
}

async function saveTask(task) {
  const { id, ...data } = task;
  await putData(`tasks/${id}`, data);
}

function getVisibleTasks() {
  const query = document.getElementById("board-search").value.trim().toLowerCase();
  return boardTasks.filter((t) => (t.title + " " + t.description).toLowerCase().includes(query));
}

function renderColumns() {
  const tasks = getVisibleTasks();
  document.getElementById("board-columns").innerHTML = BOARD_COLUMNS.map((col) =>
    getColumnTemplate(col, getColumnCardsHtml(col, tasks)),
  ).join("");
}

function getColumnCardsHtml(column, tasks) {
  const list = tasks.filter((t) => t.status === column.status);
  if (!list.length) return getEmptyTemplate(column.title);
  return list.map(getCardTemplate).join("");
}

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

initBoard();

function openAddTask(status = "todo") {
  const overlay = document.getElementById("task-overlay");
  overlay.innerHTML = getAddTaskOverlayTemplate();
  overlay.classList.add("open");
  initAddTask((formTask) => createTaskFromForm(formTask, status));
}

function closeAddTask() {
  const overlay = document.getElementById("task-overlay");
  overlay.classList.remove("open", "centered");
  overlay.innerHTML = "";
}

function closeAddTaskOnBackdrop(event) {
  if (event.target === event.currentTarget) closeAddTask();
}

async function createTaskFromForm(formTask, status) {
  const task = toBoardTask(formTask, status);
  const result = await postData("tasks", task);
  boardTasks.push({ ...task, id: result.name });
  closeAddTask();
  renderColumns();
  showToast("Task added to board");
}

function openTaskDetail(id) {
  const task = getTaskById(id);
  if (!task) return;
  const overlay = document.getElementById("task-overlay");
  overlay.innerHTML = getTaskDetailTemplate(task);
  overlay.classList.add("open", "centered");
}

async function toggleSubtask(taskId, index) {
  const task = getTaskById(taskId);
  const done = !task.subtasks[index].done;
  task.subtasks[index].done = done;
  renderColumns();
  await putData(`tasks/${taskId}/subtasks/${index}/done`, done);
}

async function deleteTask(id) {
  await deleteData(`tasks/${id}`);
  boardTasks = boardTasks.filter((t) => t.id !== id);
  closeAddTask();
  renderColumns();
}

function editTask(id) {
  const task = getTaskById(id);
  if (!task) return;
  const overlay = document.getElementById("task-overlay");
  overlay.innerHTML = getEditTaskTemplate();
  overlay.classList.add("open", "centered");
  initAddTask((formTask) => updateTaskFromForm(id, formTask), task);
}

async function updateTaskFromForm(id, formTask) {
  const index = boardTasks.findIndex((t) => t.id === id);
  const old = boardTasks[index];
  const { assignedTo, ...fields } = formTask;
  const task = {
    ...fields,
    id,
    status: old.status,
    subtasks: mergeSubtasks(formTask.subtasks, old.subtasks),
    assigned: assignedTo.map((name) => old.assigned.find((u) => u.name === name) || toAvatar(name)),
  };
  await saveTask(task);
  boardTasks[index] = task;
  renderColumns();
  openTaskDetail(id);
}

function mergeSubtasks(texts, oldSubtasks) {
  return texts.map((text) => {
    const old = oldSubtasks.find((s) => s.text === text);
    return { text, done: old ? old.done : false };
  });
}

function formatDate(isoDate) {
  if (!isoDate) return "-";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}
