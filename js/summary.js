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

function getGreeting(hour = new Date().getHours()) {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

function getUserName() {
  const user = getCurrentUser();
  return user && !user.isGuest ? user.name : null;
}

async function loadSummaryTasks() {
  return toList(await loadData("tasks"));
}

function countByStatus(tasks, status) {
  return tasks.filter((task) => task.status === status).length;
}

function getUrgentTasks(tasks) {
  return tasks.filter((task) => task.priority === "urgent" && task.status !== "done");
}

function getNextDeadline(tasks) {
  const dates = tasks.map((task) => task.dueDate).filter(Boolean).sort();
  return dates.length ? new Date(`${dates[0]}T00:00:00`) : null;
}

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

function formatDeadline(date) {
  if (!date) return "No deadline";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function buildCard(key, count, label, cssClass) {
  return {
    icon: BASE_PATH + ICON_PATH + SUMMARY_ICONS[key],
    count,
    label,
    cssClass,
    href: BASE_PATH + BOARD_URL,
  };
}

async function renderSummary() {
  let tasks = [];
  try {
    tasks = await loadSummaryTasks();
  } catch (error) {
    console.error(error);
  }
  const data = getSummaryData(tasks);
  const greetingHtml = getGreetingTemplate(getGreeting(), getUserName());
  const urgentHtml = getUrgentHtml(data);
  const cardsHtml = getCardsHtml(data);

  document.getElementById("summary").innerHTML = getSummaryTemplate(
    greetingHtml,
    urgentHtml,
    cardsHtml
  );
}

function getUrgentHtml(data) {
  return getUrgentCardTemplate(
    buildCard("urgent", data.urgent, "Tasks Urgent", ""),
    formatDeadline(data.deadline)
  );
}

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

document.addEventListener("DOMContentLoaded", renderSummary);