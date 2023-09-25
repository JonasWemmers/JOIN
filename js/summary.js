/**
 * Handles the hover state of the summary cards
 */
document.addEventListener("DOMContentLoaded", function () {
  const BOTTOMCARD1 = document.getElementById("bottomCard1");
  const BOTTOMCARD2 = document.getElementById("bottomCard2");

  BOTTOMCARD1.addEventListener("mouseenter", function () {
    document
      .getElementById("penIcon")
      .setAttribute("src", "./assets/img/icon_pen_white.svg");
  });
  BOTTOMCARD1.addEventListener("mouseleave", function () {
    document
      .getElementById("penIcon")
      .setAttribute("src", "./assets/img/icon_pen.svg");
  });

  BOTTOMCARD2.addEventListener("mouseenter", function () {
    document
      .getElementById("checkIcon")
      .setAttribute("src", "./assets/img/icon_check_white.svg");
  });
  BOTTOMCARD2.addEventListener("mouseleave", function () {
    document
      .getElementById("checkIcon")
      .setAttribute("src", "./assets/img/icon_check.svg");
  });
});

/**
 * This function initializes the summary page
 */
async function initSummary() {
  await renderGreeting();
  renderUsername();
  await loadTasks();
  await loadtoDos();
  await loadInProgress();
  await loadFeedback();
  await loadDone();
  countTasks();
  countUrgent();
}

/**
 * Renders the greeting on the page based on the current user and time of day.
 *
 * @returns {Promise<void>} A promise that resolves once the greeting is rendered.
 */
async function renderGreeting() {
  document.getElementById("greeting_sentence").innerText = getDaytimeGreeting();
  document.getElementById("greeting_name").innerText = `Guest`;
  activeUser = JSON.parse(localStorage.getItem("activeUser")) || [];
  if (activeUser != "Guest") {
    document.getElementById("greeting_name").innerText = activeUser;
  }
}

/**
 * checks the time and depending on that return a greeting
 * @returns {string} greeting - greeting sentence
 */
function getDaytimeGreeting() {
  let hour = new Date().getHours();
  if (4 <= hour && hour <= 11) {
    return "Good morning,";
  }
  if (11 < hour && hour <= 19) {
    return "Good afternoon,";
  }
  if (19 < hour || hour < 4) {
    return "Good evening,";
  }
}

/**
 * This function refers to the board page
 */
function redirectToBoard() {
  window.location.href = "board.html";
}

/**
 * This function counts the tasks of every status
 */
function countTasks() {
  let toDoVar = toDo.length;
  let inProgressVar = inProgress.length;
  let feedbackVar = feedback.length;
  let doneVar = done.length;
  let totalTasks = tasks.length;

  // Anzeige der Variablen in HTML-Elementen
  document.getElementById("counterInProgress").innerHTML = inProgressVar;
  document.getElementById("counterFeedback").innerHTML = feedbackVar;
  document.getElementById("counterAll").innerHTML = totalTasks;
  document.getElementById("openToDo").innerHTML = toDoVar;
  document.getElementById("doneToDos").innerHTML = doneVar;
}

/**
 * This function counts the number of urgent tasks
 */
function countUrgent() {
  let urgentCount = 0;

  tasks.forEach(function (task) {
    if (task.prio === "up") {
      urgentCount++;
    }
  });

  document.getElementById("urgent-counter").innerHTML = urgentCount;
}

document.addEventListener("DOMContentLoaded", function () {
  getCurrentDay();
});

/**
 * This function gets the current day of the user
 */
function getCurrentDay() {
  let currentDay = new Date().toLocaleString();
  currentDay = currentDay.slice(0, 10);
  let currentDayArray = currentDay.split(".");
  let currentMonth = getCurrentMonth(currentDayArray[1]);
  currentDay =
    currentMonth + " " + currentDayArray[0] + ", " + currentDayArray[2];

  document.getElementById(
    "currentDate"
  ).innerHTML = `<strong>${currentDay}</strong>`;
}

/**
 * This function gets the current month of the user's calendar
 * 
 * @param {number} i 
 * @returns {date}
 */
function getCurrentMonth(i) {
  const date = new Date();
  date.setMonth(i - 1);
  return date.toLocaleString("en-us", { month: "long" });
}
