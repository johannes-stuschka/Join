const BOARD_URL = "/pages/board.html"; 

const ICON_PATH = "../assets/icons/"; 
const SUMMARY_ICONS = {
  urgent: "urgent.svg",
  board: "board.svg",
  todo: "todo.svg",
  progress: "progress.svg",
  feedback: "feedback.svg",
  done: "done.svg",
};

function getGreeting(hour = new Date().getHours()) {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

// TODO: an euer Login anpassen. Guest = null zurückgeben.
function getUserName() {
  return null;
}

// TODO: durch echte Daten ersetzen. Aktuell Platzhalter aus dem Figma.
function getSummaryData() {
  return {
    urgent: 1,
    deadline: new Date(2022, 9, 16),
    board: 5,
    todo: 1,
    progress: 2,
    feedback: 2,
    done: 1,
  };
}

function formatDeadline(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function buildCard(key, count, label, cssClass) {
  return {
    icon: ICON_PATH + SUMMARY_ICONS[key],
    count,
    label,
    cssClass,
    href: BOARD_URL,
  };
}

function renderSummary() {
  const data = getSummaryData();
  const greetingHtml = getGreetingTemplate(getGreeting(), getUserName());

  const urgentHtml = getUrgentCardTemplate(
    buildCard("urgent", data.urgent, "Tasks Urgent", ""),
    formatDeadline(data.deadline)
  );

  const cards = [
    buildCard("board", data.board, "Task in Board", "card-board"),
    buildCard("todo", data.todo, "Tasks To-do", "card-small"),
    buildCard("progress", data.progress, "Task in Progress", "card-small"),
    buildCard("feedback", data.feedback, "Awaiting Feedback", "card-small"),
    buildCard("done", data.done, "Tasks Done", "card-small"),
  ];
  const cardsHtml = cards.map(getSummaryCardTemplate).join("");

  document.getElementById("summary").innerHTML = getSummaryTemplate(
    greetingHtml,
    urgentHtml,
    cardsHtml
  );
}

document.addEventListener("DOMContentLoaded", renderSummary);