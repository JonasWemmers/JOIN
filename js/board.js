//############### ONLOAD ###############//
let toDo = [];
let inProgress = [];
let feedback = [];
let done = [];
let currentDraggedElement;

async function initBoard() {
  renderUsername();
  await loadTasks();
  await loadtoDos();
  await loadInProgress();
  await loadFeedback();
  await loadDone();
  await loadUsers();
  await clearTasksContainer();
  renderTaskCardToDo();
  renderTaskCardProgress();
  renderTaskCardFeedback();
  renderTaskCardDone();
}

//############### LOADING FUNCTIONS ###############//

/**
 * This function loads the tasks from the toDo-section from the server
 */
async function loadtoDos() {
  try {
    toDo = JSON.parse(await getItem("toDo"));
  } catch (e) {
    console.error("Loading error:", e);
  }
}

/**
 * This function loads the tasks from the inProgress-section from the server
 */
async function loadInProgress() {
  try {
    inProgress = JSON.parse(await getItem("inProgress"));
  } catch (e) {
    console.error("Loading error:", e);
  }
}

/**
 * This function loads the tasks from the feedback-section from the server
 */
async function loadFeedback() {
  try {
    feedback = JSON.parse(await getItem("feedback"));
  } catch (e) {
    console.error("Loading error:", e);
  }
}

/**
 * This function loads the tasks from the done-section from the server
 */
async function loadDone() {
  try {
    done = JSON.parse(await getItem("done"));
  } catch (e) {
    console.error("Loading error:", e);
  }
}

/**
 * This function loads the usernames from the server
 */
async function loadUsers() {
  try {
    users = JSON.parse(await getItem("users"));
  } catch (e) {
    console.error("Loading error:", e);
  }
}

//############### RENDER FUNCTIONS ###############//

/**
 * Renders the task cards for the "To Do" status.
 */
function renderTaskCardToDo() {
  let toDoContainer = document.getElementById("toDoTasks");
  let renderedIDs = {};
  for (let i = 0; i < toDo.length; i++) {
    let currentTask = tasks.find((task) => task.id === toDo[i]);
    if (!renderedIDs[currentTask.id]) {
      toDoContainer.innerHTML += getTaskCardHTML(currentTask, "toDo");
      renderedIDs[currentTask.id] = true;
      renderAvatars(currentTask);
    }
  }
}

/**
 * Renders the task cards for the "In Progress" status.
 */
function renderTaskCardProgress() {
  let progressContainer = document.getElementById("inProgressTasks");
  let renderedIDs = {};
  for (let i = 0; i < inProgress.length; i++) {
    let currentTask = tasks.find((task) => task.id === inProgress[i]);
    if (!renderedIDs[currentTask.id]) {
      progressContainer.innerHTML += getTaskCardHTML(currentTask, "inProgress");
      renderedIDs[currentTask.id] = true;
      renderAvatars(currentTask);
    }
  }
}

/**
 * Renders the task cards for the "Feedback" status.
 */
function renderTaskCardFeedback() {
  let feedbackContainer = document.getElementById("feedbackTasks");
  let renderedIDs = {};
  for (let i = 0; i < feedback.length; i++) {
    let currentTask = tasks.find((task) => task.id === feedback[i]);
    if (!renderedIDs[currentTask.id]) {
      feedbackContainer.innerHTML += getTaskCardHTML(currentTask, "feedback");
      renderedIDs[currentTask.id] = true;
      renderAvatars(currentTask);
    }
  }
}

function renderTaskCardDone() {
  let doneContainer = document.getElementById("doneTasks");
  let renderedIDs = {};
  for (let i = 0; i < done.length; i++) {
    let currentTask = tasks.find((task) => task.id === done[i]);
    if (!renderedIDs[currentTask.id]) {
      doneContainer.innerHTML += getTaskCardHTML(currentTask, "done");
      renderedIDs[currentTask.id] = true;
      renderAvatars(currentTask);
    }
  }
}

/**
 * Renders the task cards for the "Done" status.
 */
async function clearTasksContainer() {
  let toDoContainer = document.getElementById("toDoTasks");
  let progressContainer = document.getElementById("inProgressTasks");
  let feedbackContainer = document.getElementById("feedbackTasks");
  let doneContainer = document.getElementById("doneTasks");

  toDoContainer.innerHTML = "";
  progressContainer.innerHTML = "";
  feedbackContainer.innerHTML = "";
  doneContainer.innerHTML = "";
}

/**
 * Renders avatars for a given task.
 *
 * @param {*} currentTask - The current task.
 */
async function renderAvatars(currentTask) {
  let avatarBox = document.getElementById("avatarBox" + currentTask["id"]);
  for (let i = 0; i < currentTask["assignments"].length; i++) {
    const name = currentTask["assignments"][i]["name"];
    let id = currentTask["assignments"][i]["id"];
    let color = getUserColor(id);
    let initials = name.match(/\b(\w)/g);
    initials = initials.join("").toUpperCase();
    avatarBox.innerHTML += `       
        <div class="avatar-container" style="background-color:${color}">${initials}</div>
    `;
  }
}

/**
 * Returns the color of a user based on their ID.
 *
 * @param {*} id - The ID of the user.
 * @returns The color of the user.
 * @throws Error if the user is not found.
 */
function getUserColor(id) {
  let currentUser = users.find((user) => user.id == id);
  if (currentUser) {
    const color = currentUser.color;
    return color;
  } else {
    throw new Error(`Benutzer mit ID ${id} wurde nicht gefunden.`);
  }
}

/**
 * Shows the detail card of a task.
 *
 * @param {*} id - The ID of the task.
 */
function showDetailCard(id) {
  let overlay = document.getElementById("overlay");
  overlay.classList.remove("d-none");

  // Clear the content of the overlay before adding the new popup
  overlay.innerHTML = "";

  getTaskDetailCardData(id);

  // Add an event listener to the overlay to close it when clicked
  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) {
      overlay.classList.add("d-none");
      overlay.innerHTML = ""; // Clear the content of the overlay
    }
  });
}

/**
 * This function is used to get the data of the task, specified by its id
 *
 * @param {int} id
 */
function getTaskDetailCardData(id) {
  currentTaskID = id;
  let currentTask = tasks.find((task) => task.id == id);
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      const task = tasks[i];
      overlay.innerHTML += getTaskDetailCardHTML(task, currentTask);
      getTaskPrio(task);
      getAssignedToDetailCard(task, id);
      showTickableSubtasks(currentTask);
    }
  }
}

/**
 * Renders the priority of a task.
 *
 * @param {*} task - The task.
 */
async function getTaskPrio(task) {
  let prioContainer = document.getElementById("prioDetail");
  switch (task["prio"]) {
    case "down":
      prioContainer.innerHTML += `
      <div
      class="prio-btn-low" 
    >
      Low
      <img id="imgUrgent" src="./assets/img/prioLow.svg" alt="" />
    </div>
      `;
      break;
    case "medium":
      prioContainer.innerHTML += `
      <div
      class="prio-btn-medium"
    >
      Medium
      <img id="imgUrgent" src="./assets/img/prioMedium.svg" alt="" />
    </div>
      `;
      break;
    case "up":
      prioContainer.innerHTML += `
      <div
      class="prio-btn-urgent"
    >
      Urgent
      <img id="imgUrgent" src="./assets/img/prioUrgent.svg" alt=""/>
    </div>
      `;
      break;
  }
}

/**
 * Renders the assigned contacts of a task in the detail card.
 *
 * @param {*} task - The task.
 */
function getAssignedToDetailCard(task) {
  let assignContainer = document.getElementById("assignDetail");
  for (let i = 0; i < task["assignments"].length; i++) {
    const contact = task["assignments"][i]["name"];
    const id = task["assignments"][i]["id"];
    let color = getUserColor(id);
    let initials = contact.match(/\b(\w)/g);
    initials = initials.join("").toUpperCase();
    assignContainer.innerHTML += `
    <div class="flex-row align-center gap-15">
      <div class="avatar-container" style="background-color:${color}">${initials}</div>
      <div class="font-weight-500">${contact}</div>
    </div>
    `;
  }
}

//############### HELP FUNCTIONS ###############//

function redirectToAddTask(status) {
  // Hier wird der Wert 'status' an die URL angehängt
  window.location.href = "task_form.html?status=" + status;
}



/**
 * This function hides the overlay div
 */
function closePopup() {
  let overlay = document.getElementById("overlay");
  overlay.classList.add("d-none");
}

/**
 * Deletes a task from the general task array.
 *
 * @param {*} id - The ID of the task.
 */
async function deleteTask(id) {
  deleteObjectById(id);
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i]["id"] == id) {
      tasks.splice(i, 1);
      await setItem("tasks", JSON.stringify(tasks));
      break;
    }
  }
  closePopup();
  initBoard();
}

/**
 *This function handles the editing of a task
 *
 * @param {int} id
 */
function editTask(id) {
  currentTaskID = id;
  let currentTask = tasks.find((task) => task.id == id);
  document.getElementById("taskContent").innerHTML = editTaskHTML(currentTask);
  selectedCategory = currentTask['category'];
  renderCategoryList();
  showAssignedContacts(currentTask);
  showSubtasks(currentTask);
}

/**
 * Shows the assigned contacts in the edit view of a task.
 *
 * @param {*} currentTask - The current task.
 */
function showAssignedContacts(currentTask) {
  let assignableContactsContainer = document.getElementById("dropdownContent");
  const assignedContacts = currentTask["assignments"].map(
    //erstellt ein neues Array nur mit "Name"s aus assignments-Array
    (assignment) => assignment["name"]
  );

  getAssignedContactsData(assignableContactsContainer, assignedContacts);
}

/**
 * This function handles the data for the assigned contacts of a task
 *
 * @param {object} assignableContactsContainer
 * @param {Array} assignedContacts
 */
async function getAssignedContactsData(
  assignableContactsContainer,
  assignedContacts
) {
  for (let i = 0; i < users.length; i++) {
    const name = users[i]["name"];
    const id = users[i]["id"];
    const checkbox = document.createElement("input");
    checkbox.id = id;
    checkbox.type = "checkbox";
    checkbox.value = name;
    checkbox.dataset.id = id;
    checkbox.onclick = function (event) {
      event.stopPropagation();
    };

    // Check if the contact is checked
    if (assignedContacts.includes(name)) {
      checkbox.checked = true;
    }
    //create a new div for every assigned contact
    const div = document.createElement("div");
    div.className = "dropdown-object";
    div.onclick = function () {
      toggleCheckbox(id);
    };
    div.innerHTML = `<span>${name}</span>`;
    div.appendChild(checkbox);

    assignableContactsContainer.appendChild(div);
  }
}

/**
 * Toggles the state of a checkbox.
 *
 * @param {string} checkboxId - The ID of the checkbox.
 */
function toggleCheckbox(checkboxId) {
  var checkbox = document.getElementById(checkboxId);
  checkbox.checked = !checkbox.checked;
}

/**
 * Retrieves the current date in the format "YYYY-MM-DD".
 *
 * @returns {string} The current date in "YYYY-MM-DD" format.
 */
function getCurrentDate() {
  const today = new Date();
  let day = today.getDate();
  let month = today.getMonth() + 1;
  const year = today.getFullYear();

  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }

  return `${year}-${month}-${day}`;
}

/**
 * Deletes an object by its ID from the appropriate arrays.
 *
 * @param {*} id - The ID of the object.
 */
async function deleteObjectById(id) {
  for (var i = 0; i < toDo.length; i++) {
    if (toDo[i] == id) {
      toDo.splice(i, 1);
      await setItem("toDo", JSON.stringify(toDo));
      return;
    }
  }

  for (var i = 0; i < inProgress.length; i++) {
    if (inProgress[i] == id) {
      inProgress.splice(i, 1);
      await setItem("inProgress", JSON.stringify(inProgress));
      return;
    }
  }

  for (var i = 0; i < feedback.length; i++) {
    if (feedback[i] == id) {
      feedback.splice(i, 1);
      await setItem("feedback", JSON.stringify(feedback));
      return;
    }
  }

  for (var i = 0; i < done.length; i++) {
    if (done[i] == id) {
      done.splice(i, 1);
      await setItem("done", JSON.stringify(done));
      return;
    }
  }
}

/**
 * Toggles the visibility of the dropdown category content.
 */
function toggleDropdownCategory() {
  let dropdownContent = document.getElementById("dropdownCategoryContent");
  let dropdownMin = document.getElementById("dropdownMinCategory");
  dropdownContent.classList.toggle("show");
  dropdownMin.classList.toggle("open");
}

/**
 * Displays the subtasks of a task in the designated container.
 *
 * @param {*} task - The task object.
 */
function showSubtasks(task) {
  let container = document.getElementById("subtasksContainer");
  for (let i = 0; i < task["taskSub"].length; i++) {
    const subTask = task["taskSub"][i]["task"];
    container.innerHTML += `
    <div class="edit-subtask-container">
      <svg onclick="deleteSubtask(${task['id']},${i})" id="subtask${i}" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <mask id="mask0_76808_2229" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect width="24" height="24" fill="#D9D9D9"/>
      </mask>
      <g mask="url(#mask0_76808_2229)">
      <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM7 6V19H17V6H7ZM9 16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16ZM13 16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16Z" fill="#2A3647"/>
      </g>
      </svg>
    <div>${subTask}<div>
  </div>
    `;
  }
}

/**
 * Searches for a task based on the input value and shows/hides tasks accordingly.
 */
function searchForTaskByInput() {
  let search = document.getElementById("search-input").value;
  search = search.toLowerCase();

  if (search.trim() === "") {
    // if input is empty show all tasks
    for (let i = 0; i < tasks.length; i++) {
      showHiddenTask(tasks[i]["id"]);
    }
  } else {
    checkInput(search);
  }
}

/**
 * This function searches for matches between the input and the tasks
 *
 * @param {object} search input field
 */
function checkInput(search) {
  for (let i = 0; i < tasks.length; i++) {
    const title = tasks[i]["title"];
    const description = tasks[i]["description"];

    if (
      title.toLowerCase().includes(search) ||
      description.toLowerCase().includes(search)
    ) {
      showHiddenTask(tasks[i]["id"]);
    } else {
      hideTask(tasks[i]["id"]);
    }
  }
}

/**
 * Hides a task card with the given ID.
 *
 * @param {*} id - The ID of the task card.
 */
function hideTask(id) {
  let taskCardContainer = document.getElementById(id);

  if (taskCardContainer) {
    taskCardContainer.style.opacity = "0";
    setTimeout(() => {
      taskCardContainer.classList.add("d-none");
    }, 500);
  }
}

/**
 * Shows a hidden task card with the given ID.
 *
 * @param {*} id - The ID of the task card.
 */
function showHiddenTask(id) {
  let taskCardContainer = document.getElementById(id);

  if (taskCardContainer) {
    taskCardContainer.classList.remove("d-none");
    setTimeout(() => {
      taskCardContainer.style.opacity = "1";
    }, 100);
  }
}

/**
 * Displays the tickable subtasks for the current task in the designated container.
 *
 * @param {*} currentTask - The current task.
 */
async function showTickableSubtasks(currentTask) {
  let subtasksContainer = document.getElementById("subtaskContent");
  subtasksContainer.innerHTML = "";

  for (let i = 0; i < currentTask["taskSub"].length; i++) {
    const subtask = currentTask["taskSub"][i]["task"];
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = subtask;

    const isClosed = currentTask["subtasksClosed"].some(
      (sub) => sub.name === subtask
    );
    checkbox.checked = isClosed;

    const div = document.createElement("div");
    div.classList.add("subtasks-row");
    div.innerHTML = `<span>${subtask}</span>`;
    div.insertBefore(checkbox, div.firstChild);

    subtasksContainer.appendChild(div);
  }
}

/**
 * Validates the subtasks form and updates the subtasksClosed and subtasksOpened properties of the current task.
 *
 * @param {*} currentTask - The current task.
 */
async function validateSubtasksForm(id) {
  let currentTask = tasks.find((task) => task.id == id);
  currentTask["subtasksClosed"] = [];
  currentTask["subtasksOpened"] = [];

  let checkboxes = document.querySelectorAll(
    "#subtaskContent input[type=checkbox]:checked"
  );
  let NullCheckboxes = document.querySelectorAll(
    "#subtaskContent input[type=checkbox]:not(:checked)"
  );

  for (var i = 0; i < checkboxes.length; i++) {
    const value = checkboxes[i].value;
    await currentTask["subtasksClosed"].push({ name: value });
  }
  for (var i = 0; i < NullCheckboxes.length; i++) {
    const value = NullCheckboxes[i].value;
    await currentTask["subtasksOpened"].push({ name: value });
  }
  await setItem("tasks", JSON.stringify(tasks));
  initBoard();
}

/**
 * This function deletes a subtask from its array including the dedicated status array (opened or closed)
 * 
 * @param {int} id 
 * @param {int} subtaskID 
 */
async function deleteSubtask(id, subtaskID) {
  let currentTask = tasks.find((task) => task.id == id);
  let subTask = currentTask['taskSub'][subtaskID]['task'];
  currentTask['taskSub'].splice(subtaskID, 1);
  await deleteSubtaskStatus(currentTask, subTask);
  reloadSubtasks(id);
}

/**
 * This function checks if the deleted subtasak is an opened or closed subtask and deletes it from the certain array
 * 
 * @param {obj} currentTask 
 * @param {string} subTask - subtask text
 */
async function deleteSubtaskStatus(currentTask, subTask){
  for (let i = 0; i < currentTask['subtasksClosed'].length; i++) {
    const subtask = currentTask['subtasksClosed'][i]['name'];
    if (subtask == subTask) {
      currentTask['subtasksClosed'].splice(i, 1);
    }
  }

  for (let i = 0; i < currentTask['subtasksOpened'].length; i++) {
    const subtask = currentTask['subtasksOpened'][i]['name'];
    if (subtask == subTask) {
      currentTask['subtasksOpened'].splice(i, 1);
    }
  }
}

/**
 * This fucntion reloads the div with subtasks
 * 
 * @param {int} id - of the task
 */
async function reloadSubtasks(id){
  let currentTask = tasks.find((task) => task.id == id);
  let subtasksContainer = document.getElementById("subtasksContainer");
  subtasksContainer.innerHTML = "";
  showSubtasks(currentTask);
}

/**
 * This function clears the subtask input div
 * 
 * @param {int} id - of the task 
 */
async function clearEditSubtasks(id){
  let subtasksContainer = document.getElementById("subtasksContainer");
  let subTaskInput = document.getElementById("subtask-input-content")
  subtasksContainer.innerHTML = "";
  subTaskInput.value = "";
  subTaskInput.placeholder = "Enter subtask..";
  reloadSubtasks(id);
}
