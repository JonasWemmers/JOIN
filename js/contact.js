contacts = [];

/**
 * Loads the contacts from the storage and assigns them to the 'contacts' array.
 * If there is an error while loading, it logs the error to the console.
 *
 */
async function loadContacts() {
  try {
    contacts = JSON.parse(await getItem("contacts"));
  } catch (e) {
    console.error("Loading error:", e);
  }
}

/**
 * Creates a new pseudo contact and adds it to the 'contacts' array.
 * Sets a new ID for the contact, marks it as a pseudo contact,
 * and stores the updated 'contacts' array in the storage.
 * Resets the form inputs.
 *
 * @param {HTMLElement} name - The input element for the contact's name.
 * @param {HTMLElement} email - The input element for the contact's email.
 * @param {HTMLElement} phone - The input element for the contact's phone number.
 */
async function createNewPseudoContact() {
  let name = document.getElementById("addName");
  let email = document.getElementById("addMail");
  let phone = document.getElementById("addTel");
  await setNewID();
  contacts.push({
    name: name.value,
    email: email.value,
    phone: phone.value,
    id: currentUserID,
    isPseudoContact: true,
  });
  await setItem("contacts", JSON.stringify(contacts));
  resetForm(name, email, phone);
}

/**
 * Resets the form inputs by clearing their values.
 * Reloads the page.
 *
 * @param {HTMLElement} name - The input element for the contact's name.
 * @param {HTMLElement} email - The input element for the contact's email.
 * @param {HTMLElement} phone - The input element for the contact's phone number.
 */
function resetForm(name, email, phone) {
  name.value = "";
  phone.value = "";
  email.value = "";
  window.location.reload();
}

/**
 * Shows the contact card overlay by removing the 'd-none' class from the 'overlay-bg' element.
 *
 */
function showCard() {
  let overlay = document.getElementById("overlay-bg");
  overlay.classList.remove("d-none");
}

/**
 * Hides the contact card overlay by adding the 'd-none' class to the 'overlay-bg' element.
 *
 */
function hideCard() {
  let overlay = document.getElementById("overlay-bg");
  overlay.classList.add("d-none");
}

/**
 * Retrieves contacts and renders them in the contact box.
 *
 */
async function getContacts() {
  await loadContacts();
  await sortContacts();
}

/**
 *
 * Sorts the contacts array by name in alphabetical order
 * by comparing the first letters
 *
 */
async function sortContacts() {
  contacts.sort(function (a, b) {
    let nameA = a.name.toLowerCase();
    let nameB = b.name.toLowerCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
  createGroupsByInitialLetter(contacts);
}

/**
 * Creates groups of contacts based on the first letter of their names.
 * @param {Array} sortedArray - The array of contacts sorted by name.
 * @returns {Object} - The grouped contacts.
 */
let groupedContacts = {};
async function createGroupsByInitialLetter(sortedArray) {
  for (let i = 0; i < sortedArray.length; i++) {
    const name = sortedArray[i].name;
    const firstLetter = name[0].toUpperCase();

    if (!groupedContacts[firstLetter]) {
      groupedContacts[firstLetter] = [];
    }

    groupedContacts[firstLetter].push(sortedArray[i]);
  }
  await renderSortedContactGroups();
  return groupedContacts;
}

/**
 * Renders the groups of contacts in the contact box.
 */
async function renderSortedContactGroups() {
  let contactBox = document.getElementById("contactBox");
  for (let i = 0; i < Object.keys(groupedContacts).length; i++) {
    const letter = Object.keys(groupedContacts)[i];
    contactBox.innerHTML += `<div class="contact-letter">
      <span class="contact-single-letter">${letter}</span>
      <div class="contact-letter-container" id="group${letter}"></div>
    </div>`;
    showGroupedContacts(letter, i);
  }
}

/**
 * Renders the contacts within a group.
 * @param {string} letter - The letter representing the contact group.
 * @param {number} i - The index of the contact group.
 */
function showGroupedContacts(letter, i) {
  let groupBox = document.getElementById("group" + letter);
  for (let j = 0; j < Object.values(groupedContacts)[i].length; j++) {
    const contact = Object.values(groupedContacts)[i][j];
    const id = contact["id"];
    const name = contact["name"];
    const mail = contact["email"];
    const color = contact["color"];
    groupBox.innerHTML += `
    <div class="contact-item" onclick="renderContactCard(${id})">
      <div class="initials-image" id="contactInitials" style="background-color: ${color}">
        ${giveContactInitials(name)}
      </div>
      <div class="contact-name-mail">
        <span id="contactName">${name}</span>
        <span id="contactMail">${mail}</span>
      </div>
    </div>`;
  }
}

/**
 * Renders the contact card based on the provided ID.
 * @param {*} id - The ID of the contact.
 */
function renderContactCard(id) {
  let contactDetailsContainer = document.getElementById("contactDetails");
  let contactDetailsMobileContainer = document.getElementById(
    "contactMobileDetails"
  );
  let currentContact = contacts.find((contact) => contact.id === id);
  const name = currentContact["name"];
  const mail = currentContact["email"];
  const color = currentContact["color"];
  const phone = currentContact["phone"];
  initials = giveContactInitials(name);
  if (document.body.clientWidth > 1024) {
    contactDetailsContainer.innerHTML = giveContactDetailsHTML(
      name,
      mail,
      initials,
      id,
      color,
      phone
    );
  } else {
    contactDetailsMobileContainer.innerHTML = giveContactDetailsMobileHTML(
      name,
      mail,
      initials,
      id,
      color,
      phone
    );
    document.getElementById("newContactMobile").classList.add("d-none");
    document.getElementById("contentMainContainer").classList.add("d-none");
  }
}

/**
 * Removes the "d-none" class from the newContactMobile and contentMainContainer elements, returning to the contact list view.
 *
 */
function returnToContactList() {
  document.getElementById("newContactMobile").classList.remove("d-none");
  document.getElementById("contentMainContainer").classList.remove("d-none");
}

/**
 * Generates initials based on the provided name.
 * @param {string} name - The name to generate initials from.
 * @returns {string} - The generated initials.
 */
function giveContactInitials(name) {
  let initials = name.match(/\b(\w)/g);
  initials = initials.join("").toUpperCase();
  return initials;
}

/**
 * Deletes all contacts from the server.
 */
async function deleteAllContactsFromServer() {
  try {
    contacts = JSON.parse(await getItem("contacts"));
    contacts = [];
    await setItem("contacts", JSON.stringify(contacts));
  } catch (e) {
    console.error("Loading error:", e);
  }
}


/**
 * This function checks the screen width and handles the popup visibility according to the screen size
 */
function checkScreenWidth() {
  document
    .getElementById("addTaskPopUp")
    .addEventListener("click", checkScreenWidth);

  var screenWidth = window.innerWidth;
  var targetWidth = 1351;
  if (screenWidth >= targetWidth) {
    showAddTaskPopUp();
  } else {
    window.location.href = "task_form.html";
  }
}

/**
 * This function deletes a contact from the contacts array
 * 
 * @param {int} id of the contact
 */
async function deleteCard(id) {
  try {
    let contacts = await getItem("contacts");
    if (contacts) {
      contacts = JSON.parse(contacts);
      const updatedContacts = contacts.filter((contact) => contact.id !== id);
      await setItem("contacts", JSON.stringify(updatedContacts));
      location.reload();
    }
  } catch (e) {
    console.error("Deleting error:", e);
  }
}

/**
 * Shows the contact card overlay by removing the 'd-none' class from the 'overlay-bg' element.
 *
 */
function showEditCard(id) {
  let overlay = document.getElementById("overlay-edit-bg");
  overlay.classList.remove("d-none");
  loadContactToEditPopUp(id);
}

/**
 * Hides the contact card overlay by adding the 'd-none' class to the 'overlay-bg' element.
 *
 */
function hideEditCard() {
  let overlay = document.getElementById("overlay-edit-bg");
  overlay.classList.add("d-none");
}

/**
 * This function shows the contact task overlay by removing the 'd-none' class
 */
function showAddTaskPopUp() {
  let overlay = document.getElementById("overlayPopUpbg");
  overlay.classList.remove("d-none");
}

/**
 * This function hides the contact task overlay by adding the 'd-none' class
 */
function hideAddTaskPopUp() {
  let overlay = document.getElementById("overlayPopUpbg");
  overlay.classList.add("d-none");
}

/**
 * @param {string} name - The name of the contact.
 * @param {string} mail - The email of the contact.
 * @param {string} tel - The initials of the contact.
 * @returns {string} - The generated HTML.
 */
function loadContactToEditPopUp(id) {
  let overlayContainer = document.getElementById("overlay-edit-bg");
  let currentContact = contacts.find((contact) => contact.id == id);
  const name = currentContact["name"];
  const mail = currentContact["email"];
  let tel = currentContact["phone"];
  if (!tel) {
    tel = "nicht vergeben";
  } else {
    tel = currentContact["phone"];
  }
  overlayContainer.innerHTML = "";
  overlayContainer.innerHTML += getEditHTML(name, mail, tel, id);
}



/**
 * Saves the edited contact details for the specified ID.
 *
 * @param {number} id - The ID of the contact to edit.
 * @returns {Promise<void>} A promise that resolves once the contact is successfully edited and saved.
 */
async function saveEditContact(id) {
  console.log("Saving contact");
  let currentContact = contacts.find((contact) => contact.id == id);

  console.log("contacts:", contacts);
  console.log("id:", id);

  if (currentContact) {
    let editedName = document.getElementById("addNameID").value;
    let editedMail = document.getElementById("addMailID").value;
    let editedTel = document.getElementById("addTelID").value;

    // Überprüfe, ob die Werte geändert wurden
    if (editedName.trim() !== "") {
      currentContact.name = editedName;
    }
    if (editedMail.trim() !== "") {
      currentContact.email = editedMail;
    }
    if (editedTel.trim() !== "") {
      currentContact.phone = editedTel;
    }

    try {
      await setItem("contacts", JSON.stringify(contacts));

      // Schließe das Editierungs-Popup
      hideEditCard();
      location.reload();
    } catch (error) {
      console.error("Fehler beim Speichern des Kontakts:", error);
    }
  } else {
    console.error(`Kontakt mit ID "${id}" wurde nicht gefunden.`);
  }
}
