let isDropSuccessful = false;
let sourceID;
let sourceArray;

/**
 * This function handles the start of the dragging process
 *
 * @param {int} id of the task
 * @param {string} status of the task
 */
async function startDragging(id, status) {
  let screenWidth = window.innerWidth;
  currentDraggedElement = id;
  await getSourceArrayByStatus(status, id);
  if (screenWidth>1399) {
    await showDropArea(status);
  }
}

/**
 * THis function is used to handle the dropping process
 *
 * @param {Event} ev
 */
function allowDrop(ev) {
  ev.preventDefault();
}

/**
 * THis function is used to handle the dragging process
 *
 * @param {Event} ev
 */
function drag(ev) {
  ev.dataTransfer.setData("text/plain", ev.target.id);
}

/**
 * This function enables the hover effect for the drop areas
 *
 * @param {Event} ev
 */
function showHoverEffect(ev) {
  if (isSourceTodo(ev)) {
    ev.target.classList.add("drag-over");
  } else if (isSourceProgress(ev)) {
    ev.target.classList.add("drag-over");
  } else if (isSourceFeedback(ev)) {
    ev.target.classList.add("drag-over");
  } else if (isSourceDone(ev)) {
    ev.target.classList.add("drag-over");
  }
}

/**
 * This function checks if the source array is 'toDo'
 *
 * @param {Event} ev
 * @returns {boolean}
 */
function isSourceTodo(ev) {
  return (
    sourceArray == "toDo" &&
    (ev.target.id == "inProgress" ||
      ev.target.id == "feedback" ||
      ev.target.id == "done")
  );
}

/**
 * This function checks if the source array is 'inProgress'
 *
 * @param {Event} ev
 * @returns {boolean}
 */
function isSourceProgress(ev) {
  return (
    sourceArray == "inProgress" &&
    (ev.target.id == "toDo" ||
      ev.target.id == "feedback" ||
      ev.target.id == "done")
  );
}

/**
 * This function checks if the source array is 'feedback'
 *
 * @param {Event} ev
 * @returns {boolean}
 */
function isSourceFeedback(ev) {
  return (
    sourceArray == "feedback" &&
    (ev.target.id == "toDo" ||
      ev.target.id == "inProgress" ||
      ev.target.id == "done")
  );
}

/**
 * This function checks if the source array is 'done'
 *
 * @param {Event} ev
 * @returns {boolean}
 */
function isSourceDone(ev) {
  return (
    sourceArray == "done" &&
    (ev.target.id == "toDo" ||
      ev.target.id == "feedback" ||
      ev.target.id == "inProgress")
  );
}

/**
 * This function disables the hover effect
 *
 * @param {Event} ev
 */
function hideHoverEffect(ev) {
  ev.target.classList.remove("drag-over");
}

/**
 * This function handles the process of moving a task to a new status
 *
 * @param {string} status of the task
 * @returns {void} - if status is invalid
 */
async function moveTo(status) {
  let targetArray;
  switch (status) {
    case "toDo":
      targetArray = toDo;
      await moveToTodo(targetArray);
      break;
    case "inProgress":
      targetArray = inProgress;
      await moveToProgress(targetArray);
      break;
    case "feedback":
      targetArray = feedback;
      await moveToFeedback(targetArray);
      break;
    case "done":
      targetArray = done;
      await moveToDone(targetArray);
      break;
    default:
      console.log("Invalid status:", status);
      return;
  }
  await checkTargetArrayForID(targetArray, status);
}

/**
 * This function bundles the operations for moving a task to the ToDo-section
 *
 * @param {Array} targetArray
 */
async function moveToTodo(targetArray) {
  getBorderRemoveFunctions();
  isDropSuccessful = true;
  await deleteTaskFromDragged(targetArray);
  initBoard();
}

/**
 * This function bundles the operations for moving a task to the inProgress-section
 *
 * @param {Array} targetArray
 */
async function moveToProgress(targetArray) {
  getBorderRemoveFunctions();
  isDropSuccessful = true;
  await deleteTaskFromDragged(targetArray);
  initBoard();
}

/**
 * This function bundles the operations for moving a task to the feedback-section
 *
 * @param {Array} targetArray
 */
async function moveToFeedback(targetArray) {
  getBorderRemoveFunctions();
  isDropSuccessful = true;
  await deleteTaskFromDragged(targetArray);
  initBoard();
}

/**
 * This function bundles the operations for moving a task to the done-section
 *
 * @param {Array} targetArray
 */
async function moveToDone(targetArray) {
  getBorderRemoveFunctions();
  isDropSuccessful = true;
  await deleteTaskFromDragged(targetArray);
  initBoard();
}

async function moveToResponsive(currentTask, status) {
  //console.log(currentTask,status)
  await startDragging(currentTask, status);
  await moveTo(status);
}

/**
 * This function deletes the tasks from their source arrays after being dropped to another array
 *
 * @param {Array} targetArray
 */
async function deleteTaskFromDragged(targetArray) {
  if (isDropSuccessful == true && targetArray !== sourceArray) {
    switch (sourceArray) {
      case "toDo":
        await deleteFromTodo();
        break;
      case "inProgress":
        await deleteFromProgress();
        break;
      case "feedback":
        await deleteFromFeedback();
        break;
      case "done":
        await deleteFromDone();
        break;
    }
  }
}

/**
 * This function deletes tasks if they were being dragged from the toDo-section and dropped in another section
 */
async function deleteFromTodo() {
  let toDoIndex = toDo.indexOf(sourceID);
  toDo.splice(toDoIndex, 1);
  await setItem("toDo", JSON.stringify(toDo));
  isDropSuccessful = false;
}

/**
 * This function deletes tasks if they were being dragged from the inProgress-section and dropped in another section
 */
async function deleteFromProgress() {
  let inProgressIndex = inProgress.indexOf(sourceID);
  inProgress.splice(inProgressIndex, 1);
  await setItem("inProgress", JSON.stringify(inProgress));
  isDropSuccessful = false;
}

/**
 * This function deletes tasks if they were being dragged from the feedback-section and dropped in another section
 */
async function deleteFromFeedback() {
  let feedbackIndex = feedback.indexOf(sourceID);
  feedback.splice(feedbackIndex, 1);
  await setItem("feedback", JSON.stringify(feedback));
  isDropSuccessful = false;
}

/**
 * This function deletes tasks if they were being dragged from the done-section and dropped in another section
 */
async function deleteFromDone() {
  let doneIndex = done.indexOf(sourceID);
  done.splice(doneIndex, 1);
  await setItem("done", JSON.stringify(done));
  isDropSuccessful = false;
}

/**
 * This function checks if the dropped task is already in the target array.
 * If not, it pushes the task into the target array.
 *
 * @param {Array} targetArray
 * @param {string} status
 * @returns {void} - if dropped element is already in the array
 */
async function checkTargetArrayForID(targetArray, status) {
  const elementExists = targetArray.includes(currentDraggedElement);
  if (elementExists) {
    console.log("Element already exists in the array.");
    return;
  }

  const pushPromise = new Promise((resolve) => {
    targetArray.push(currentDraggedElement);
    resolve();
  });

  await pushPromise;

  await setItem(status, JSON.stringify(targetArray));
}

/**
 * This function gets the source array of the dragged element
 *
 * @param {string} status
 * @param {int} id
 * @returns {null} - if no status is found
 */
async function getSourceArrayByStatus(status, id) {
  switch (status) {
    case "toDo":
      sourceID = id;
      sourceArray = "toDo";
      break;
    case "inProgress":
      sourceID = id;
      sourceArray = "inProgress";
      break;
    case "feedback":
      sourceID = id;
      sourceArray = "feedback";
      break;
    case "done":
      sourceID = id;
      sourceArray = "done";
      break;
    default:
      console.error("Invalid status:", status);
      return null;
  }
}


/**
 * This function handles the visibility of the borders from possible drop areas
 * 
 * @param {string} status 
 */
async function showDropArea(status) {
  switch (status) {
    case "toDo":
      showBorders_notToDo();
      break;
    case "inProgress":
      showBorders_notProgress();
      break;
    case "feedback":
      showBorders_notFeedback();
      break;
    case "done":
      showBorders_notDone();
      break;
  }
}

/**
 * This function shows all borders from drop areas except toDo
 */
function showBorders_notToDo() {
  document.getElementById("inProgress").classList.add("add-border");
  document.getElementById("feedback").classList.add("add-border");
  document.getElementById("done").classList.add("add-border");
}

/**
 * This function shows all borders from drop areas except inProgress
 */
function showBorders_notProgress() {
  document.getElementById("toDo").classList.add("add-border");
  document.getElementById("feedback").classList.add("add-border");
  document.getElementById("done").classList.add("add-border");
}

/**
 * This function shows all borders from drop areas except feedback
 */
function showBorders_notFeedback() {
  document.getElementById("toDo").classList.add("add-border");
      document.getElementById("inProgress").classList.add("add-border");
      document.getElementById("done").classList.add("add-border");
}

/**
 * This function shows all borders from drop areas except done
 */
function showBorders_notDone() {
  document.getElementById("toDo").classList.add("add-border");
      document.getElementById("inProgress").classList.add("add-border");
      document.getElementById("feedback").classList.add("add-border");
}

/**
 * This function hides all borders from drop areas
 */
function getBorderRemoveFunctions() {
  document.getElementById("toDo").classList.remove("add-border");
  document.getElementById("inProgress").classList.remove("add-border");
  document.getElementById("feedback").classList.remove("add-border");
  document.getElementById("done").classList.remove("add-border");
}
