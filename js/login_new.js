let users = [];
let currentUserID = 0;


/**
 * This function initializes the login
 */
async function init() {
  await loadUsers();
  await loadContacts();
}

/**
 * This function loads the users from the server
 */
async function loadUsers() {
  try {
    users = JSON.parse(await getItem("users"));
  } catch (e) {
    console.error("Loading error:", e);
  }
}

/**
 * This function checks if the email and password from the input fields are found in the database.
 * If the credentials match, the user is redirected to summary.html.
 * Else -> a message is shown: "User not found".
 *
 * @returns {void}
 */
async function login() {
  let email = document.getElementById("emailLogin");
  let password = document.getElementById("passwordLogin");
  let user = users.find(
    (u) => u.email === email.value && u.password == password.value
  );

  if (user) {
    isLoggedIn = true;
    await localStorage.setItem("activeUser", JSON.stringify(user.name));
    await localStorage.setItem("isLoggedIn", true);
    checkViewPortAndRedirect();
  } else {
    document.getElementById("userNotFound").classList.remove("d-none");
    email.value = "";
    password.value = "";
  }
  rememberMe(email, password);
}

/**
 * Stores the email and password in local storage for remembering the user login,
 * or removes them if the remember me checkbox is not checked.
 *
 * @param {HTMLElement} email - Input field for Email
 * @param {HTMLElement} password - Input field for Password
 */
function rememberMe(email, password) {
  let checkbox = document.getElementById("checkbox");
  if (checkbox.checked) {
    localStorage.setItem("rememberMeEmail", email.value);
    localStorage.setItem("rememberMePassword", password.value);
  } else if (!checkbox.checked) {
    localStorage.removeItem("rememberMeEmail");
    localStorage.removeItem("rememberMePassword");
  }
}

/**
 * Displays the previously remembered contact information stored in local storage.
 *
 */
function showRememberContact() {
  let rememberMeEmailField = document.getElementById("emailLogin");
  let rememberMePasswordField = document.getElementById("passwordLogin");

  let storedEmail = localStorage.getItem("rememberMeEmail");
  if (storedEmail) {
    rememberMeEmailField.value = storedEmail;
  }

  let storedPassword = localStorage.getItem("rememberMePassword");
  if (storedPassword) {
    rememberMePasswordField.value = storedPassword;
  }
}

/**
 * Redirects to a certain page depending on the viewport width
 *
 */
function checkViewPortAndRedirect() {
  if (document.body.clientWidth > 756) {
    window.location.href = "summary.html";
  } else {
    window.location.href = "hello_mobile.html";
  }
}

/**
 * Log in as a guest user for demo purposes and save it as active user in local storage
 *
 */
async function guestLogin() {
  let guest = { name: "Guest" };
  isLoggedIn = true;
  await localStorage.setItem("isLoggedIn", true);
  await localStorage.setItem("activeUser", JSON.stringify(guest.name));
  if (document.body.clientWidth > 1024) {
    window.location.href = "summary.html";
  } else {
    window.location.href = "hello_mobile.html";
  }
}

/**
 * This function adds a new user to the database by getting the user details from the signup form.
 *
 */
async function signUpNewUser() {
  let name = document.getElementById("nameSignup");
  let email = document.getElementById("emailSignup");
  let password = document.getElementById("passwordSignup");
  await setNewID();

  await pushNewUserData(name, email, password)

  resetForm(name, email, password);
}

/**
 * This function pushes the data of the new user to the server
 * 
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 */
async function pushNewUserData(name, email, password){
  // Generate random RGB values for color
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);

  users.push({
    name: name.value,
    email: email.value,
    password: password.value,
    id: currentUserID,
    color: `rgb(${r}, ${g}, ${b})`, // Add color property with the generated RGB values
  });
  contacts.push({
    name: name.value,
    email: email.value,
    id: currentUserID,
    isPseudoContact: false,
    color: `rgb(${r}, ${g}, ${b})`, // Add color property with the generated RGB values
  });

  await setItem("users", JSON.stringify(users));
  await setItem("contacts", JSON.stringify(contacts));
}

/**
 * This function provides every user with a new id
 */
async function setNewID() {
  let res = JSON.parse(await getItem("currentUserID"));
  if (res) {
    currentUserID = res + 1;
    await setItem("currentUserID", JSON.stringify(currentUserID));
  } else {
    currentUserID = 1; //problem: if some network error occurs, the current user id is set to 1 --> try/catch? // alternative: if(users.length <=1 ....)
    await setItem("currentUserID", JSON.stringify(currentUserID));
  }
}

/**
 * This function resets the input fields
 * 
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 */
function resetForm(name, email, password) {
  email.value = "";
  password.value = "";
  name.value = "";

  window.location.href = "success_signup.html";
}

/**
 * This function checks if the user with the provided email exists in the database before sending a reset password email.
 * If the user exists, it returns true. If not, it prevents the default action and shows an error message.
 *
 * @param {Event} e - The event parameter is used to prevent sending the email if the user does not exist in the database.
 */
function checkIfUserExists(e) {
  let email = document.getElementById("forgotPwMail");
  let user = users.find((u) => u.email === email.value);
  if (user) {
    return true;
  } else {
    e.preventDefault();
    document.getElementById("forgotUserNotFound").classList.remove("d-none");
    email.value = "";
    return false;
  }
}

/**
 * Check if the email entered by the user already exists in the database before adding a new user.
 * If the email doesn't exist, add the new user.
 * If the email already exists, show an error message and redirect the user to the login page.
 *
 * @returns {boolean} - Returns false if email already exists, true otherwise.
 */
function checkSignUp() {
  let email = document.getElementById("emailSignup");
  let user = users.find((u) => u.email === email.value);
  if (!user) {
    signUpNewUser();
    console.log(users);
  } else {
    document.getElementById("userExists").classList.remove("d-none");
    document.getElementById("goToLoginBtn").classList.remove("d-none");
    email.value = "";
    email.focus();
    return false;
  }
}

// --------------- LOGIN SCREEN: SHOW AND HIDE SECTION  ----------------------

/**
 * Redirects the user to the login page.
 *
 */
function goToLogin() {
  window.location.href = "index.html";
}

/**
 * This function hides the "sign up" section and shows the login section on the login screen
 *
 */
function closeSignUp() {
  document.getElementById("login").classList.remove("d-none");
  document.getElementById("signUp").classList.add("d-none");
  document.getElementById("signUpButton").classList.remove("d-none");
}

/**
 * This function displays the "forgot password" section and hides the login and sign-up sections on the login screen
 *
 */
function openForgotPassword() {
  document.getElementById("forgotPassword").classList.remove("d-none");
  document.getElementById("login").classList.add("d-none");
  document.getElementById("signUpButton").classList.add("d-none");
}

/**
 * This function displays the "sign up" section and hides the login section on the login screen
 *
 */
function openSignUp() {
  document.getElementById("login").classList.add("d-none");
  document.getElementById("signUp").classList.remove("d-none");
  document.getElementById("signUpButton").classList.add("d-none");
  document.getElementById("forgotPassword").classList.add("d-none");
  document.getElementById("goToLoginBtn").classList.remove("d-none");
}

/**
 * This function hides the "forgot password" section and shows the login and sign-up sections on the login screen
 *
 */
function closeForgotPassword() {
  document.getElementById("forgotPassword").classList.add("d-none");
  document.getElementById("login").classList.remove("d-none");
  document.getElementById("signUpButton").classList.remove("d-none");
}

/**
 * This function redirects to the login page
 *
 */
function openIndex() {
  window.location.href = "index.html";
}

// ---------------- PASSWORD SHOW AND HIDE FUNCTIONS -------------------------

/**
 * This function retrieves the user's email from the URL and changes the password for that specific user.
 *
 */
function changePassword() {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email");
  let newPassword = document.getElementById("new-password");
  let newPasswordConfirm = document.getElementById("new-password-confirm");
  let findMailInUsers = users.find((u) => u.email == email);
  if (newPassword.value == newPasswordConfirm.value) {
    settingNewPassword(newPassword, newPasswordConfirm, findMailInUsers);
  } else {
    document.getElementById("user-not-found").classList.remove("d-none");
    newPassword.value = "";
    newPasswordConfirm.value = "";
  }
}

/**
 * This function is used to change the password icon to an eye icon when the password input field is focused
 *
 * @param  {string} id - The ID of the element to be targeted.
 * @param  {string} name -  The name of the section to be targeted (choose from: login, signup, reset, confirm).
 */
function checkInputType(id, name) {
  let typeIsPassword = document.getElementById(id).type == "password";
  if (typeIsPassword == true) changePwIconToEye(name);
}

/**
 * This function is used to set a new password for the user and update it in the database.
 *
 * @param {HTMLElement} newPassword - Input field for the new password
 * @param {HTMLElement} newPasswordConfirm - Input field to confirm the new password
 * @param {Object} findMailInUsers - The user object that contains the email address
 */
async function settingNewPassword(
  newPassword,
  newPasswordConfirm,
  findMailInUsers
) {
  findMailInUsers.password = newPassword.value;
  await backend.setItem("users", JSON.stringify(users));
  window.location.href = "success_reset_pw.html";
  newPassword.value = "";
  newPasswordConfirm.value = "";
}

/**
 * Redirects the user to the login page.
 *
 */
function goToLogin() {
  window.location.href = "index.html";
}

/**
 * This function toggles the password icon to a show/hide button for better user experience.
 *
 * @param  {string} name -  The name of the section to be targeted (choose from: login, signup, reset, confirm).
 */
function changePwIconToEye(name) {
  console.log("pwNoShow" + name);
  document.getElementById(`pwNoShow${name}`).classList.remove("d-none");
  document.getElementById(`pwIcon${name}`).classList.add("d-none");
  document.getElementById(`pwShow${name}`).classList.add("d-none");
}

/**
 * This function changes the type of the targeted input field from password to text, while also changing the toggle button.
 *
 * @param  {string} id - The ID of the element you want to target.
 * @param  {string} name - The name of the section to be targeted (choose from: login, signup, reset, confirm).
 */
function changePwToText(id, name) {
  document.getElementById(`pwNoShow${name}`).classList.add("d-none");
  document.getElementById(`pwShow${name}`).classList.remove("d-none");
  document.getElementById(id).type = "text";
}

/**
 * This function changes the type of the targeted input field from text to password, while also changing the toggle button.
 *
 * @param  {string} id - The ID of the element you want to target.
 * @param  {string} name - The name of the section to be targeted (choose from: login, signup, reset, confirm).
 */
function changeTextToPw(id, name) {
  document.getElementById(`pwNoShow${name}`).classList.remove("d-none");
  document.getElementById(`pwShow${name}`).classList.add("d-none");
  document.getElementById(id).type = "password";
}
