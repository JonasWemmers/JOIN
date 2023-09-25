/**
 * On mobile, users are greeted for 3 seconds and shown the topper and footer
 * as data is fetched. A personalized greeting with the user's name is then
 * displayed, followed by a quick 3-second redirect to summary.html.
 */
async function renderGreetingHello() {
  await init();
  renderWithoutActiveSection();
  document.getElementById("greeting-time-hello").innerText =
    getDaytimeGreeting();
  document.getElementById("greeting-name-mobile").innerText = `Guest`;
  if (activeUser != "Guest") {
    document.getElementById("greeting-name-mobile").innerText = activeUser;
  }
  setTimeout(() => {
    window.location.href = "summary.html";
  }, 3000);
}

/**
 *  waiting
 */
async function renderWithoutActiveSection() {
  await includeHTML();
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
 