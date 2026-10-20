const BOARD_URL = "pages/board.html";

const ICON_PATH = "assets/icons/";
const SUMMARY_ICONS = {
  urgent: "urgent.png",
  board: "task_in_board.png",
  todo: "todo.png",
  progress: "in_progress.png",
  feedback: "afeedback.png",
  done: "done.png",
};

// Picks the greeting for the time of day.
function getGreeting(hour = new Date().getHours()) {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

// Returns the name of the logged-in user, or null for the guest.
function getUserName() {
  const user = getCurrentUser();
  return user && !user.isGuest ? user.name : null;
}

// Loads all tasks.
async function loadSummaryTasks() {
  return toList(await loadData("tasks"));
}

// Counts the tasks with a status.
function countByStatus(tasks, status) {
  return tasks.filter((task) => task.status === status).length;
}

// Returns the urgent tasks that are not done yet.
function getUrgentTasks(tasks) {
  return tasks.filter((task) => task.priority === "urgent" && task.status !== "done");
}

// Finds the earliest due date.
function getNextDeadline(tasks) {
  const dates = tasks
    .map((task) => task.dueDate)
    .filter(Boolean)
    .sort();
  return dates.length ? new Date(`${dates[0]}T00:00:00`) : null;
}

// Collects all numbers the summary shows.
function getSummaryData(tasks) {
  const urgentTasks = getUrgentTasks(tasks);
  return {
    urgent: urgentTasks.length,
    deadline: getNextDeadline(urgentTasks),
    board: tasks.length,
    todo: countByStatus(tasks, "todo"),
    progress: countByStatus(tasks, "progress"),
    feedback: countByStatus(tasks, "feedback"),
    done: countByStatus(tasks, "done"),
  };
}

// Formats a date like "October 24, 2026".
function formatDeadline(date) {
  if (!date) return "No deadline";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Builds the data for one summary card.
function buildCard(key, count, label, cssClass) {
  return {
    icon: BASE_PATH + ICON_PATH + SUMMARY_ICONS[key],
    count,
    label,
    cssClass,
    href: BASE_PATH + BOARD_URL,
  };
}

// Loads the tasks and renders the summary page.
async function initSummary() {
  let tasks = [];
  try {
    tasks = await loadSummaryTasks();
  } catch (error) {
    console.error(error);
  }
  renderSummary(getSummaryData(tasks));
}

// Renders the greeting, the urgent card and the status cards.
function renderSummary(data) {
  const greetingHtml = getGreetingTemplate(getGreeting(), getUserName());
  document.getElementById("summary").innerHTML = getSummaryTemplate(
    greetingHtml,
    getUrgentHtml(data),
    getCardsHtml(data),
  );
}

// Renders the urgent card with the next deadline.
function getUrgentHtml(data) {
  return getUrgentCardTemplate(buildCard("urgent", data.urgent, "Tasks Urgent", ""), formatDeadline(data.deadline));
}

// Renders the cards for the board and each status.
function getCardsHtml(data) {
  const cards = [
    buildCard("board", data.board, "Task in Board", "card-board"),
    buildCard("todo", data.todo, "Tasks To-do", "card-todo"),
    buildCard("progress", data.progress, "Task in Progress", "card-small"),
    buildCard("feedback", data.feedback, "Awaiting Feedback", "card-small"),
    buildCard("done", data.done, "Tasks Done", "card-small"),
  ];
  return cards.map(getSummaryCardTemplate).join("");
}

document.addEventListener("DOMContentLoaded", initSummary);
