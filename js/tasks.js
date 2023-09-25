let tasks = [];
let subtasks = [];
let currentTaskID = 0;
let selectedCategory;
let currentPrioStatus;
let selectedColor;
let categories = [];
let isTaskFormChecked = false;
let isCategoryChecked = true;

/**
 * Initializes the tasks by loading data, rendering assignable contacts, and rendering the category list.
 *
 * @returns {Promise<void>} A promise that resolves once the tasks are initialized.
 */
async function initTasks() {
  renderUsername();
  await loadTasks();
  await loadUsers();
  renderAssignableContacts();
  renderCategoryList();
}

/**
 * Adds a new task by setting its properties based on user input, updating relevant data,
 * and performing necessary actions like redirecting or reloading the page.
 *
 * @returns {Promise<void>} A promise that resolves once the new task is added.
 */
async function addNewTask(status) {
  await getCurrentData();
  let taskData = new Object();
  await getTaskValues(taskData);

  checkTaskForm(taskData);
  if (isTaskFormChecked) {
    pushTaskData(taskData);

    const urlParams = new URLSearchParams(window.location.search);
    const urlStatus = urlParams.get("status");
    if (
      urlStatus === "feedback" ||
      urlStatus === "inProgress" ||
      urlStatus === "done"
    ) {
      status = urlStatus;
    }

    eval(status).push(currentTaskID);

    await pushNewTaskToServer(status);
  }
}

/**
 * This function is called to retrieve the current task values from the input fields
 *
 * @param {obj} taskData
 */
async function getTaskValues(taskData) {
  taskData.taskTitle = document.getElementById("title");
  taskData.taskDescription = document.getElementById("description");
  taskData.taskDueDate = document.getElementById("datePicker");
  taskData.taskSub = document.getElementById("subtaskContent");
}

/**
 * This function loads the current tasks data from the server for easier adding.
 */
async function getCurrentData() {
  await setNewTaskID();
  await loadtoDos();
  await loadInProgress();
  await loadFeedback();
  await loadDone();
}

/**
 * This function pushes the new task to the server and redirects to the board.html
 *
 * @param {string} status of the task
 */
async function pushNewTaskToServer(status) {
  const taskAddedElement = document.getElementById("taskAdded");
  taskAddedElement.classList.remove("d-none");
  setTimeout(() => {
    taskAddedElement.classList.add("d-none"); // Füge die Klasse "d-none" hinzu, um das Element auszublenden
    redirectToBoard(); // Rufe die Funktion zum Neuladen der Seite auf
  }, 1000); // Warte vier Sekunden (4000 Millisekunden) und führe dann den Code im setTimeout-Callback aus

  await setItem("tasks", JSON.stringify(tasks));
  await setItem(status, JSON.stringify(eval(status)));
}

/**
 * This function checks if all input fields are filled
 *
 * @param {string} taskTitle
 * @param {string} taskDescription
 * @param {string} taskDueDate
 * @param {string} taskSub
 * @returns
 */
function checkTaskForm(taskData) {
  // Überprüfung, ob alle Felder ausgefüllt sind
  if (
    taskData.taskTitle.value === "" ||
    taskData.taskDescription.value === "" ||
    taskData.taskDueDate.value === "" ||
    currentPrioStatus === undefined ||
    selectedCategory == undefined
  ) {
    let taskAlert = document.getElementById("taskAlert");
    taskAlert.innerHTML = "";
    if (taskData.taskTitle.value === "")
      taskAlert.innerHTML += "Field 'Title' must be filled.<br>";
    if (taskData.taskDescription.value === "")
      taskAlert.innerHTML += "Field 'Description' must be filled.<br>";
    if (taskData.taskDueDate.value === "")
      taskAlert.innerHTML += "Field 'Due Date' must be filled.<br>";
    if (currentPrioStatus === undefined)
      taskAlert.innerHTML += "A 'Prio' status must be checked.<br>";
    if (selectedCategory === undefined)
      taskAlert.innerHTML += "Field 'Category' must be filled.<br>";

    return; // Beende die Funktion, da nicht alle Felder ausgefüllt sind
  } else {
    isTaskFormChecked = true;
  }
}

/**
 * This function pushes the task data to the task array on server
 *
 * @param {string} taskTitle
 * @param {string} taskDescription
 * @param {date} taskDueDate
 */
function pushTaskData(taskData) {
  tasks.push({
    title: taskData.taskTitle.value,
    description: taskData.taskDescription.value,
    category: selectedCategory,
    prio: currentPrioStatus,
    color: selectedColor,
    assignments: validateAssignmentForm(),
    dueDate: taskData.taskDueDate.value,
    taskSub: subtasks,
    subtasksOpened: subtasks,
    subtasksClosed: [],
    id: currentTaskID,
  });
}

/**
 * Sets a new task ID by retrieving the current ID, incrementing it, and saving it.
 *
 * @returns {Promise<void>} A promise that resolves once the new task ID is set.
 */
async function setNewTaskID() {
  try {
    let res = JSON.parse(await getItem("currentTaskID"));
    currentTaskID = res + 1;
    await setItem("currentTaskID", JSON.stringify(currentTaskID));
  } catch (e) {
    currentTaskID = 1; //problem: if some network error occurs, the current task id is set to 1 --> try/catch? // alternative: if(tasks.length <=1 ....)
    await setItem("currentTaskID", JSON.stringify(currentTaskID));
  }
}

/**
 * Loads tasks from storage by retrieving and parsing the "tasks" item.
 *
 * @returns {Promise<void>} A promise that resolves once the tasks are loaded.
 */
async function loadTasks() {
  try {
    tasks = JSON.parse(await getItem("tasks"));
  } catch (e) {
    console.error("Loading error:", e);
  }
}

/**
 * Adds a subtask to the subtasks array based on user input.
 *
 * @returns {Promise<void>} A promise that resolves once the new subtask is added.
 */
async function subTaskAddToJson() {
  let task = document.getElementById("subtask-input-content");
  if (task.value.length < 3) {
    task.style.fontsize = "10px";
    task.placeholder = "Type in more than 2 characters...";
    return;
  }
  subtasks.push({
    task: task.value,
  });

  addNewSubTask();
  task.placeholder = "Enter subtask...";
  task.value = "";
}

function subTaskDelete() {
  document.getElementById("subtask-input-content").value = "";
  subtasks = [];
  document.getElementById("subtaskContent").innerHTML = "";
}

/**
 * Adds a subtask to the subtasks and subtasksOpened arrays of a task specified by ID.
 *
 * @param {number} id - The ID of the task to add the subtask to.
 * @returns {Promise<void>} A promise that resolves once the new subtask is added.
 */
async function addSubtaskFromEdit(id) {
  let currentTask = tasks.find((task) => task.id == id);
  let task = document.getElementById("subtask-input-content");
  currentTask["taskSub"].push({
    task: task.value,
  });
  currentTask["subtasksOpened"].push({
    task: task.value,
  });
  //await showTickableSubtasks(currentTask);
  task.value = "";
}

/**
 * Adds the newly created subtasks to the subtask content area.
 *
 * @returns {Promise<void>} A promise that resolves once the new subtasks are added.
 */
async function addNewSubTask() {
  let subtaskContent = document.getElementById("subtaskContent");
  subtaskContent.innerHTML = "";

  for (let i = 0; i < subtasks.length; i++) {
    let task = subtasks[i]["task"];
    subtaskContent.innerHTML += `
    <div>${i + 1}. ${task}</div>`;
  }
}

/**
 * Edits a task's properties based on user input and performs necessary actions like reloading the page.
 *
 * @param {number} id - The ID of the task to edit.
 * @returns {Promise<void>} A promise that resolves once the task is edited.
 */
async function editTaskBoard(id) {
  let currentTask = tasks.find((task) => task.id == id);
  let taskTitle = document.getElementById("title");
  let taskDescription = document.getElementById("description");
  let taskDueDate = document.getElementById("datePicker");
  await getCurrentTaskData(
    currentTask,
    taskTitle,
    taskDescription,
    taskDueDate
  );
  await setCategoryForEdit(currentTask);
  if (isCategoryChecked) {
    await setItem("tasks", JSON.stringify(tasks));
    await setItem("toDo", JSON.stringify(toDo));
    await initBoard();
    reloadPage();
  }
}

/**
 * This function gets the data from the current task for editing
 *
 * @param {int} currentTask
 * @param {string} taskTitle
 * @param {string} taskDescription
 * @param {date} taskDueDate
 */
async function getCurrentTaskData(
  currentTask,
  taskTitle,
  taskDescription,
  taskDueDate
) {
  currentTask["title"] = taskTitle.value;
  currentTask["description"] = taskDescription.value;
  currentTask["category"] = document.getElementById("categoryEdit").innerText;
  //selectedCategory = document.getElementById('dropdownMinCategory').innerText;
  currentTask["prio"] = document.getElementById("prioValue").innerText;
  currentTask["color"] = selectedColor;
  currentTask["assignments"] = validateAssignmentForm();
  currentTask["dueDate"] = taskDueDate.value;
}

/**
 * Sets the category for editing a task and checks if a readable value is in the input field.
 *
 * @param {object} currentTask - The current task being edited.
 * @returns {Promise<void>} A promise that resolves once the category is set.
 */
async function setCategoryForEdit(currentTask) {
  isCategoryChecked = false;
  let newCategoryField = document.getElementById("new-category");
  document.getElementById("categoryMessage").innerHTML = "";
  if (selectedCategory !== "" && selectedCategory !== undefined) {
    if (newCategoryField) {
      await checkNewCategoryField(currentTask)
    } else {
      await confirmNewCategory(currentTask);
    }
  } else {
    rejectNewCategory();
  }
}

async function confirmNewCategory(currentTask){
  document.getElementById("categoryMessage").classList.add("d-none");
  document.getElementById("categoryEdit").innerText =currentTask["category"];
  isCategoryChecked = true;
}

function rejectNewCategory(){
  document.getElementById("categoryMessage").classList.remove("d-none");
    document.getElementById("categoryMessage").innerHTML =
      "Please choose a category by name and color. Confirm your choice.";
}

async function checkNewCategoryField(currentTask) {
  await checkNewCategory();
      if (isCategoryChecked) {
        confirmNewCategory(currentTask);
      } else {
        rejectNewCategory()
      }
}

/**
 * Deletes all tasks from the server by clearing relevant data arrays and updating storage.
 *
 * @returns {Promise<void>} A promise that resolves once all tasks are deleted.
 */
async function deleteAllTasksFromServer() {
  try {
    tasks = JSON.parse(await getItem("tasks"));
    toDo = JSON.parse(await getItem("toDo"));
    inProgress = JSON.parse(await getItem("inProgress"));
    feedback = JSON.parse(await getItem("feedback"));
    done = JSON.parse(await getItem("done"));
    tasks = [];
    toDo = [];
    inProgress = [];
    feedback = [];
    done = [];
    await setItem("tasks", JSON.stringify(tasks));
    await setItem("toDo", JSON.stringify(toDo));
    await setItem("inProgress", JSON.stringify(inProgress));
    await setItem("feedback", JSON.stringify(feedback));
    await setItem("done", JSON.stringify(done));
  } catch (e) {
    console.error("Loading error:", e);
  }
}

/**
 * Sets the priority status of a task to "Urgent".
 *
 * @returns {void}
 */
async function TaskButtonUrgent() {
  setUrgentButtonColors();

  // Setze das Bild für "Medium" zurück
  let imageMedium = document.getElementById("imgMedium");
  imageMedium.style.filter = "none";

  // Setze das Bild für "Low" zurück
  let imageLow = document.getElementById("imgLow");
  imageLow.style.filter = "none";

  let imageUrgent = document.getElementById("imgUrgent");
  imageUrgent.style.filter = "brightness(10000%) contrast(1000%)";
}

/**
 * This function handles the colors if the urgent button is active
 */
function setUrgentButtonColors() {
  let buttonUrgent = document.getElementById("prioUrgent");
  let buttonMedium = document.getElementById("prioMedium");
  let buttonLow = document.getElementById("prioLow");
  buttonUrgent.style.backgroundColor = "#FF3D00";
  buttonUrgent.style.filter = "contrast(1)";
  buttonMedium.style.filter = "contrast(1)";
  buttonLow.style.filter = "contrast(1)";
  buttonMedium.style.backgroundColor = "white";
  buttonLow.style.backgroundColor = "white";
  buttonMedium.style.color = "black";
  buttonUrgent.style.color = "white";
  buttonLow.style.color = "black";
}

function getPrioStatus(prioStatus) {
  currentPrioStatus = prioStatus;
}

function setPrioStatus(prioStatus) {
  let prioValue = document.getElementById("prioValue");
  prioValue.innerText = prioStatus;
}

/**
 * Sets the priority status of a task to "Medium".
 *
 * @returns {void}
 */
async function TaskButtonMedium() {
  setMediumButtonColors();

  // Setze das Bild für "Urgent" zurück
  let imageUrgent = document.getElementById("imgUrgent");
  imageUrgent.style.filter = "none";

  // Setze das Bild für "Low" zurück
  let imageLow = document.getElementById("imgLow");
  imageLow.style.filter = "none";

  let imageMedium = document.getElementById("imgMedium");
  imageMedium.style.filter = "brightness(10000%) contrast(1000%)";
}

/**
 * This function handles the colors if the medium button is active
 */
function setMediumButtonColors() {
  let buttonUrgent = document.getElementById("prioUrgent");
  let buttonMedium = document.getElementById("prioMedium");
  let buttonLow = document.getElementById("prioLow");
  buttonUrgent.style.backgroundColor = "white";
  buttonMedium.style.backgroundColor = "#FFA800";
  buttonUrgent.style.filter = "contrast(1)";
  buttonMedium.style.filter = "contrast(1)";
  buttonLow.style.filter = "contrast(1)";
  buttonMedium.style.color = "white";
  buttonUrgent.style.color = "black";
  buttonLow.style.color = "black";
  buttonLow.style.backgroundColor = "white";
}

/**
 * Sets the priority status of a task to "Low".
 *
 * @returns {void}
 */
async function TaskButtonLow() {
  setLowButtonColors();

  // Setze das Bild für "Urgent" zurück
  let imageUrgent = document.getElementById("imgUrgent");
  imageUrgent.style.filter = "none";

  // Setze das Bild für "Medium" zurück
  let imageMedium = document.getElementById("imgMedium");
  imageMedium.style.filter = "none";

  let imageLow = document.getElementById("imgLow");
  imageLow.style.filter = "brightness(10000%) contrast(1000%)";
}

/**
 * This function handles the colors if the low button is active
 */
function setLowButtonColors() {
  let buttonUrgent = document.getElementById("prioUrgent");
  let buttonMedium = document.getElementById("prioMedium");
  let buttonLow = document.getElementById("prioLow");
  buttonUrgent.style.backgroundColor = "white";
  buttonMedium.style.backgroundColor = "white";
  buttonLow.style.backgroundColor = "#7AE229";
  buttonUrgent.style.filter = "contrast(1)";
  buttonMedium.style.filter = "contrast(1)";
  buttonLow.style.filter = "contrast(1)";
  buttonMedium.style.color = "black";
  buttonUrgent.style.color = "black";
  buttonLow.style.color = "white";
}

/**
 * Function to reload the current page.
 */
function reloadPage() {
  location.reload();
}

/**
 * Function to redirect to the "board.html" page.
 */
function redirectToBoard() {
  window.location.href = "board.html";
}

/**
 * Function to check the screen width and perform corresponding actions.
 */
function checkScreenWidth() {
  document
    .getElementById("addTaskPopUp")
    .addEventListener("click", checkScreenWidth);

  var screenWidth = window.innerWidth;

  // Definiere die gewünschte Bildschirmbreite, ab der weitergeleitet wird
  var targetWidth = 1351;

  // Überprüfe, ob die Bildschirmbreite größer oder gleich der Zielbreite ist
  if (screenWidth >= targetWidth) {
    // Öffne das Pop-up-Fenster hier
    showAddTaskPopUp();
  } else {
    // Leite zur anderen Seite weiter
    window.location.href = "task_form.html";
  }
}

/**
 * Function to show the add task pop-up window.
 */
function showAddTaskPopUp() {
  var overlay = document.getElementById("addTaskPopUp");
  overlay.style.display = "block";
}

/**
 * Function to hide the add task pop-up window.
 */
function hideAddTaskPopUp() {
  var overlay = document.getElementById("addTaskPopUp");
  overlay.style.display = "none";
}

/**
 * Function to show the edit task pop-up window.
 */
function showEditTaskPopUp() {
  var overlay = document.getElementById("editTaskPopUp");
  overlay.style.display = "block";
}

/**
 * Function to hide the edit task pop-up window.
 */
function hideEditTaskPopUp() {
  var overlay = document.getElementById("editTaskPopUp");
  overlay.style.display = "none";
}

/**
 * Function to render the assignable contacts.
 */
async function renderAssignableContacts() {
  let assignableContactsContainer = document.getElementById("dropdownContent");
  for (let i = 0; i < users.length; i++) {
    const name = users[i]["name"];
    const id = users[i]["id"];
    createContactDiv(name, id, assignableContactsContainer);
  }
}

/**
 * This function creates a new div for every assignable contact in the dropdown list
 *
 * @param {string} name
 * @param {int} id
 * @param {obj} assignableContactsContainer
 */
function createContactDiv(name, id, assignableContactsContainer) {
  const div = document.createElement("div");
  div.className = "dropdown-object";
  div.addEventListener("click", function () {
    toggleCheckbox(id);
  });

  const span = document.createElement("span");
  span.innerText = name;
  div.appendChild(span);

  const checkbox = document.createElement("input");
  checkbox.id = id;
  checkbox.type = "checkbox";
  checkbox.value = name;
  checkbox.dataset.id = id;
  checkbox.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  div.appendChild(checkbox);
  assignableContactsContainer.appendChild(div);
}

/**
 * Function to toggle the state of a checkbox.
 *
 * @param {string} checkboxId - The ID of the checkbox.
 */
function toggleCheckbox(checkboxId) {
  var checkbox = document.getElementById(checkboxId);
  checkbox.checked = !checkbox.checked;
}

/**
 * Function to render the category list.
 */
function renderCategoryList() {
  let categoryListContainer = document.getElementById(
    "dropdownCategoryContent"
  );
  categoryListContainer.innerHTML = "";
  categoryListContainer.innerHTML += `
  <div class="dropdown-object" onclick="renderNewCategoryField()">
    <div id="newCategory">New category</div>  
  </div>


    <div class="dropdown-object" onclick="saveSelectedCategory(this, '${"red"}'); toggleDropdownCategory()">
    <div class="flex-row">
      <span>Backoffice</span>
      <div class="category-color margin-left-10" style="background-color: red" id="backofficeField"></div>
    </div>
  </div>
  
  <div class="dropdown-object" onclick="saveSelectedCategory(this, '${"pink"}'); toggleDropdownCategory()">
    <div class="flex-row">
      <span>Sales</span>
      <div class="category-color margin-left-10" style="background-color: pink"></div>
    </div>
  </div>
  
  `;
}

/**
 * Renders a new category field in the dropdown menu.
 */
function renderNewCategoryField() {
  let dropdownField = document.getElementById("dropdownMinCategory");
  document.getElementById("select-color-category").classList.remove("d-none");

  dropdownField.innerHTML = /*html*/ `
    <div class="flex-row space-between align-center">
    <input placeholder="Enter new category" id="new-category" class="category-input" onclick="stopDropdown(event)">

      <div class="flex-row align-center height-100 categoryBtns">

      <svg onclick="clearSelections(); toggleDropdownCategory()" width="24" height="24" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.9616 7.65405L7.65385 22.9618" stroke="#2A3647" stroke-width="2" stroke-linecap="round"/>
        <path d="M22.8172 23.1062L7.50944 7.79844" stroke="#2A3647" stroke-width="2" stroke-linecap="round"/>
      </svg>



        <div class="vert-border"></div>
          <svg onclick="checkNewCategory(); stopDropdown(event);" width="24" height="30" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <mask id="mask0_75592_9963" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="25" height="24">
            <rect x="0.144531" width="24" height="24" fill="#D9D9D9"/>
            </mask>
            <g mask="url(#mask0_75592_9963)">
            <path d="M9.69474 15.15L18.1697 6.675C18.3697 6.475 18.6072 6.375 18.8822 6.375C19.1572 6.375 19.3947 6.475 19.5947 6.675C19.7947 6.875 19.8947 7.1125 19.8947 7.3875C19.8947 7.6625 19.7947 7.9 19.5947 8.1L10.3947 17.3C10.1947 17.5 9.96141 17.6 9.69474 17.6C9.42807 17.6 9.19474 17.5 8.99474 17.3L4.69474 13C4.49474 12.8 4.3989 12.5625 4.40724 12.2875C4.41557 12.0125 4.51974 11.775 4.71974 11.575C4.91974 11.375 5.15724 11.275 5.43224 11.275C5.70724 11.275 5.94474 11.375 6.14474 11.575L9.69474 15.15Z" fill="#2A3647"/>
            </g>
          </svg>
      
      </div>
    </div>
  `;
  toggleDropdownCategory();
}

/**
 * Stops the propagation of the event to parent elements.
 *
 * @param {Event} event - The event object.
 */
function stopDropdown(event) {
  event.stopPropagation();
}

/**
 * Clears the selections made in the dropdown menu.
 */
function clearSelections() {
  renderNormalCategoryField();
  renderCategoryList();
  toggleDropdownCategory();
  hideSelectColor();
  hideErrorMessage();
  hideCategoryDisplay();
}

/**
 * Hides the select color section in the dropdown menu.
 */
function hideSelectColor() {
  document.getElementById("select-color-category").classList.add("d-none");
}

/**
 * Hides the error message.
 */
function hideErrorMessage() {
  document.getElementById("errorMessage").textContent = "";
}

/**
 * Hides the category display section.
 */
function hideCategoryDisplay() {
  document.getElementById("categoryDisplay").style.display = "none";
  document.getElementById("categoryDisplay").textContent = "";
}

/**
 * Renders the normal category field in the dropdown menu.
 */
async function renderNormalCategoryField() {
  document.getElementById("categoryDisplay").style.display = "none";

  let dropdownField = document.getElementById("dropdownMinCategory");
  dropdownField.innerHTML = `
    <span>Select category</span>
    <img src="./assets/img/arrow_down_black.svg" alt="">
  `;
}

/**
 * Saves the selected category and its color.
 *
 * @param {Element} element - The selected category element.
 * @param {string} color - The selected color.
 */
function saveSelectedCategory(element, color) {
  selectedCategory = element.innerText;
  let dataField = document.getElementById("categoryEdit");
  dataField.innerText = selectedCategory;
  let dropdownMin = document.getElementById("dropdownMinCategory");
  dropdownMin.querySelector("span").innerText = selectedCategory;
  selectedColor = color;
}

/**
 * Toggles the visibility of the dropdown menu.
 */
function toggleDropdown() {
  let dropdownContent = document.getElementById("dropdownContent");
  let dropdownMin = document.getElementById("dropdownMin");

  dropdownContent.classList.toggle("show");
  dropdownMin.classList.toggle("open");
}

/**
 * Validates the assignment form and returns the selected checkbox values.
 *
 * @returns {Array} - An array of selected checkbox values.
 */
function validateAssignmentForm() {
  let selectedValues = [];
  let checkboxes = document.querySelectorAll(
    "#dropdownContent input[type=checkbox]:checked"
  );

  for (var i = 0; i < checkboxes.length; i++) {
    const value = checkboxes[i].value;
    const id = checkboxes[i].dataset.id;
    selectedValues.push({ id, name: value });
  }
  return selectedValues;
}

/**
 * Clears the checked state of all checkboxes in the dropdown menu.
 */
function clearCheckboxes() {
  let checkboxes = document.querySelectorAll(
    "#dropdownContent input[type=checkbox]:checked"
  );

  for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].checked = false;
  }
  toggleDropdown();
}

/**
 * Updates the task card icons based on the provided ID.
 *
 * @param {string} id - The ID of the task.
 */
function updateTaskCardIcons(id) {
  const imgUrgentTask = document.getElementById("imgUrgentTask");
  const imgMediumTask = document.getElementById("imgMediumTask");
  const imgLowTask = document.getElementById("imgLowTask");

  if (imgUrgentTask && imgMediumTask && imgLowTask) {
    // Verstecke alle Icons
    imgUrgentTask.classList.add("d-none");
    imgMediumTask.classList.add("d-none");
    imgLowTask.classList.add("d-none");

    // Zeige das entsprechende Icon basierend auf prio
    if (id === "urgent") {
      imgUrgentTask.classList.remove("d-none");
    } else if (id === "medium") {
      imgMediumTask.classList.remove("d-none");
    } else if (id === "low") {
      imgLowTask.classList.remove("d-none");
    }
  }
}

/**
 * Selects a color.
 *
 * @param {number} id - The ID of the selected color.
 */
function selectColor(id) {
  // Remove "selected-color" class from all colors
  for (let i = 1; i < 8; i++) {
    document.getElementById(`color${i}`).classList.remove("selected-color");
  }
  // Add "selected-color" class to the chosen color
  document.getElementById(`color${id}`).classList.add("selected-color");
  selectedColor = document.getElementById(`color${id}`).style.backgroundColor;
}

/**
 * Checks if a new category can be created.
 * Calls createNewCategory() if a color is selected and a category name is entered.
 * Otherwise, displays an alert message and hides the label.
 */
async function checkNewCategory() {
  const newCategoryInput = document.getElementById("new-category");
  const categoryDisplay = document.getElementById("categoryDisplay");
  const categoryMessage = document.getElementById("categoryMessage");
  const dataField = document.getElementById("categoryEdit");

  if (selectedColor && newCategoryInput.value !== "") {
    selectedCategory = newCategoryInput.value;
    dataField.innerText = newCategoryInput.value;
    hideErrorMessage();
    hideSelectColor();
    isCategoryChecked = true;
    if (categoryMessage) {
      categoryMessage.innerHTML = "";
    }
  } else {
    displayErrorMessage("Please insert a category name and a color!");
  }

  // Clear category display if input is empty
  if (newCategoryInput.value === "") {
    hideCategoryDisplay(categoryDisplay);
  }
}

/**
 * Displays an error message.
 *
 * @param {string} message - The error message to display.
 */
function displayErrorMessage(message) {
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.innerHTML = "";
  errorMessage.innerHTML = `
    <span>${message}</span>
  `
  
}

function hideLabel() {
  document.getElementById("errorMessage").textContent = "";
}

/**
 * Hides the category display section.
 */
function hideCategoryDisplay() {
  const categoryDisplay = document.getElementById("categoryDisplay");
  categoryDisplay.style.display = "none";
  categoryDisplay.textContent = "";
}

/**
 * Event listener that executes the specified code when the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", function () {
  const datePicker = document.getElementById("datePicker");
  if (datePicker) {
    const currentDate = new Date().toISOString().split("T")[0];
    datePicker.setAttribute("min", currentDate);
  }
});
