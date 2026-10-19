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

// Renders the board and loads tasks and contacts.
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

// Saves the default tasks when the database is empty.
async function seedTasks() {
  for (const task of DEFAULT_TASKS) {
    await postData("tasks", task);
  }
  return await loadData("tasks");
}

// Loads the tasks, or creates the defaults first.
async function loadTasks() {
  let data = await loadData("tasks");
  if (!data) data = await seedTasks();
  boardTasks = toList(data).map(normalizeTask);
}

// Adds empty values for fields Firebase leaves out.
function normalizeTask(task) {
  return { ...task, description: task.description || "", subtasks: task.subtasks || [], assigned: task.assigned || [] };
}

// Finds a task by id.
function getTaskById(id) {
  return boardTasks.find((t) => t.id === id);
}

// Saves a whole task in Firebase.
async function saveTask(task) {
  const { id, ...data } = task;
  await putData(`tasks/${id}`, data);
}

// Returns the tasks whose title or description contains the search text.
function getVisibleTasks() {
  const query = document.getElementById("board-search").value.trim().toLowerCase();
  return boardTasks.filter((t) => (t.title + " " + t.description).toLowerCase().includes(query));
}

// Renders all four columns.
function renderColumns() {
  const tasks = getVisibleTasks();
  document.getElementById("board-columns").innerHTML = BOARD_COLUMNS.map((col) =>
    getColumnTemplate(col, getColumnCardsHtml(col, tasks)),
  ).join("");
}

// Renders the cards of one column, or the empty hint.
function getColumnCardsHtml(column, tasks) {
  const list = tasks.filter((t) => t.status === column.status);
  if (!list.length) return getEmptyTemplate(column.title);
  return list.map(getCardTemplate).join("");
}

initBoard();

// Closes the overlay.
function closeAddTask() {
  const overlay = document.getElementById("task-overlay");
  overlay.classList.remove("open", "centered");
  overlay.innerHTML = "";
}

// Closes the overlay when the backdrop is clicked.
function closeAddTaskOnBackdrop(event) {
  if (event.target === event.currentTarget) closeAddTask();
}

// Saves a task from the overlay and adds it to the board.
async function createTaskFromForm(formTask, status) {
  const task = toBoardTask(formTask, status);
  const result = await postData("tasks", task);
  boardTasks.push({ ...task, id: result.name });
  closeAddTask();
  renderColumns();
  showToast("Task added to board");
}

// Opens the detail view of a task.
function openTaskDetail(id) {
  const task = getTaskById(id);
  if (!task) return;
  const overlay = document.getElementById("task-overlay");
  overlay.innerHTML = getTaskDetailTemplate(task);
  overlay.classList.add("open", "centered");
}

// Checks or unchecks a subtask and saves it.
async function toggleSubtask(taskId, index) {
  const task = getTaskById(taskId);
  const done = !task.subtasks[index].done;
  task.subtasks[index].done = done;
  renderColumns();
  await putData(`tasks/${taskId}/subtasks/${index}/done`, done);
}

// Deletes a task and closes the detail view.
async function deleteTask(id) {
  await deleteData(`tasks/${id}`);
  boardTasks = boardTasks.filter((t) => t.id !== id);
  closeAddTask();
  renderColumns();
}

// Opens the edit form for a task.
function editTask(id) {
  const task = getTaskById(id);
  if (!task) return;
  const overlay = document.getElementById("task-overlay");
  overlay.innerHTML = getEditTaskTemplate();
  overlay.classList.add("open", "centered");
  initAddTask((formTask) => updateTaskFromForm(id, formTask), task);
}

// Saves the edited task and shows its detail view again.
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

// Keeps the done state of subtasks whose text did not change.
function mergeSubtasks(texts, oldSubtasks) {
  return texts.map((text) => {
    const old = oldSubtasks.find((s) => s.text === text);
    return { text, done: old ? old.done : false };
  });
}

// Turns "2026-10-24" into "24/10/2026".
function formatDate(isoDate) {
  if (!isoDate) return "-";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

// Opens the add task overlay. On mobile it opens the add task page instead.
function openAddTask(status = "todo") {
  if (window.matchMedia("(max-width: 700px)").matches) {
    window.location.href = "add_task.html";
    return;
  }
  const overlay = document.getElementById("task-overlay");
  overlay.innerHTML = getAddTaskOverlayTemplate();
  overlay.classList.add("open");
  initAddTask((formTask) => createTaskFromForm(formTask, status));
}
