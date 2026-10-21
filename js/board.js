const BOARD_COLUMNS = [
  { status: "todo", title: "To do" },
  { status: "progress", title: "In progress" },
  { status: "feedback", title: "Await feedback" },
  { status: "done", title: "Done" },
];

const MAX_CARD_AVATARS = 4;

let boardTasks = [];
let draggedTaskId = null;

/**
 * Renders the board and loads tasks and contacts.
 *
 * @returns {Promise<void>}
 */
async function initBoard() {
  if (!requireLogin()) return;
  renderLayout();
  document.addEventListener("click", closeMoveMenuOnOutsideClick, true);
  document.getElementById("board").innerHTML = getBoardTemplate();
  document.getElementById("board-search").addEventListener("input", renderColumns);
  try {
    await Promise.all([loadTasks(), loadTaskContacts()]);
  } catch (error) {
    console.error(error);
  }
  renderColumns();
}

/**
 * Loads the tasks from Firebase.
 *
 * @returns {Promise<void>}
 */
async function loadTasks() {
  const data = await loadData("tasks");
  boardTasks = toList(data).map(normalizeTask);
}

/**
 * Adds empty values for fields Firebase leaves out.
 *
 * @param {Object} task - The task as stored in Firebase.
 * @returns {Object} The task with all fields.
 */
function normalizeTask(task) {
  return { ...task, description: task.description || "", subtasks: task.subtasks || [], assigned: task.assigned || [] };
}

/**
 * Finds a task by id.
 *
 * @param {string} id - The id of the task.
 * @returns {Object|undefined} The task, or undefined.
 */
function getTaskById(id) {
  return boardTasks.find((t) => t.id === id);
}

/**
 * Saves a whole task in Firebase.
 *
 * @param {Object} task - The task including its id.
 * @returns {Promise<void>}
 */
async function saveTask(task) {
  const { id, ...data } = task;
  await putData(`tasks/${id}`, data);
}

/**
 * Returns the tasks whose title or description contains the search text.
 *
 * @returns {Object[]} The matching tasks.
 */
function getVisibleTasks() {
  const query = document.getElementById("board-search").value.trim().toLowerCase();
  return boardTasks.filter((t) => (t.title + " " + t.description).toLowerCase().includes(query));
}

/**
 * Renders all four columns.
 */
function renderColumns() {
  const tasks = getVisibleTasks();
  const scrollPositions = getColumnScrollPositions();
  document.getElementById("board-columns").innerHTML = BOARD_COLUMNS.map((col) =>
    getColumnTemplate(col, getColumnCardsHtml(col, tasks)),
  ).join("");
  restoreColumnScrollPositions(scrollPositions);
}

/**
 * Reads how far each column is scrolled, so a new render does not jump back.
 *
 * @returns {{left: number, top: number}[]} The scroll position of every column.
 */
function getColumnScrollPositions() {
  return [...document.querySelectorAll(".column-body")].map((body) => ({ left: body.scrollLeft, top: body.scrollTop }));
}

/**
 * Scrolls every column back to its old position.
 *
 * @param {{left: number, top: number}[]} positions - The positions from getColumnScrollPositions.
 */
function restoreColumnScrollPositions(positions) {
  document.querySelectorAll(".column-body").forEach((body, i) => {
    if (!positions[i]) return;
    body.scrollLeft = positions[i].left;
    body.scrollTop = positions[i].top;
  });
}

/**
 * Renders the cards of one column, or the empty hint.
 *
 * @param {{status: string, title: string}} column - The column.
 * @param {Object[]} tasks - The tasks that match the search.
 * @returns {string} The HTML.
 */
function getColumnCardsHtml(column, tasks) {
  const list = tasks.filter((t) => t.status === column.status);
  if (!list.length) return getEmptyTemplate(column.title);
  return list.map(getCardTemplate).join("");
}

/**
 * Closes the overlay.
 */
function closeAddTask() {
  const overlay = document.getElementById("task-overlay");
  overlay.classList.remove("open", "centered");
  overlay.innerHTML = "";
}

/**
 * Closes the overlay when the backdrop is clicked.
 *
 * @param {MouseEvent} event - The click event.
 */
function closeAddTaskOnBackdrop(event) {
  if (event.target === event.currentTarget) closeAddTask();
}

/**
 * Saves a task from the overlay and adds it to the board.
 *
 * @param {Object} formTask - The values read from the add task form.
 * @param {string} status - The column the task is added to.
 * @returns {Promise<void>}
 */
async function createTaskFromForm(formTask, status) {
  const task = toBoardTask(formTask, status);
  const result = await postData("tasks", task);
  boardTasks.push({ ...task, id: result.name });
  closeAddTask();
  renderColumns();
  showToast("Task added to board");
}

/**
 * Opens the detail view of a task.
 *
 * @param {string} id - The id of the task.
 */
function openTaskDetail(id) {
  const task = getTaskById(id);
  if (!task) return;
  const overlay = document.getElementById("task-overlay");
  overlay.innerHTML = getTaskDetailTemplate(task);
  overlay.classList.add("open", "centered");
}

/**
 * Checks or unchecks a subtask and saves it.
 *
 * @param {string} taskId - The id of the task.
 * @param {number} index - The position of the subtask in the list.
 * @returns {Promise<void>}
 */
async function toggleSubtask(taskId, index) {
  const task = getTaskById(taskId);
  const done = !task.subtasks[index].done;
  task.subtasks[index].done = done;
  renderColumns();
  await putData(`tasks/${taskId}/subtasks/${index}/done`, done);
}

/**
 * Deletes a task and closes the detail view.
 *
 * @param {string} id - The id of the task.
 * @returns {Promise<void>}
 */
async function deleteTask(id) {
  await deleteData(`tasks/${id}`);
  boardTasks = boardTasks.filter((t) => t.id !== id);
  closeAddTask();
  renderColumns();
}

/**
 * Opens the edit form for a task.
 *
 * @param {string} id - The id of the task.
 */
function editTask(id) {
  const task = getTaskById(id);
  if (!task) return;
  const overlay = document.getElementById("task-overlay");
  overlay.innerHTML = getEditTaskTemplate();
  overlay.classList.add("open", "centered");
  initAddTask((formTask) => updateTaskFromForm(id, formTask), task);
}

/**
 * Saves the edited task and shows its detail view again.
 *
 * @param {string} id - The id of the task.
 * @param {Object} formTask - The values read from the add task form.
 * @returns {Promise<void>}
 */
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

/**
 * Keeps the done state of subtasks whose text did not change.
 *
 * @param {string[]} texts - The subtask texts from the form.
 * @param {{text: string, done: boolean}[]} oldSubtasks - The subtasks before editing.
 * @returns {{text: string, done: boolean}[]} The new subtasks.
 */
function mergeSubtasks(texts, oldSubtasks) {
  return texts.map((text) => {
    const old = oldSubtasks.find((s) => s.text === text);
    return { text, done: old ? old.done : false };
  });
}

/**
 * Turns "2026-10-24" into "24/10/2026".
 *
 * @param {string} isoDate - The date as "YYYY-MM-DD".
 * @returns {string} The date as "DD/MM/YYYY", or "-".
 */
function formatDate(isoDate) {
  if (!isoDate) return "-";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

/**
 * Opens the add task overlay. On mobile it opens the add task page instead.
 *
 * @param {string} [status="todo"] - The column the new task goes into.
 */
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
