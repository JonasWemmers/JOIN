
/**
 * Toggles the display of the logout button and options mobile based on the window width.
 *
 */
function toggleLogout() {
  var logoutButton = document.getElementById("logout-button");
  var optionsMobile = document.getElementById("options-mobile");
  if (window.innerWidth > 756) {
    logoutButton.classList.toggle("d-none");
  } else {
    optionsMobile.classList.toggle("d-none");
  }
}


/**
 * This function refers to the landing page
 */
async function logout() {
  await localStorage.setItem("isLoggedIn", false);
  window.location.href = "index.html";
}

/**
 * This function sets the current users name
 */
async function renderUsername() {
  await includeHTML();
  await init();
  document.getElementById("userName").innerText = activeUser;
}
