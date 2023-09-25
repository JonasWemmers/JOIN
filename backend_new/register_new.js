let users = [];


async function init(){
    loadUsers();
}

/**
 * This function loads all the users in the database
 */
async function loadUsers(){
    let registeredUsers = document.getElementById('registeredUsers');

    try {
        users = JSON.parse(await getItem('users'));
    } catch(e){
        console.error('Loading error:', e);
    }

    registeredUsers.innerHTML = 'Usermail: ' + users[0]['email'];
}

/**
 * This function adds a new user to the database
 */
async function register() {
    registerBtn.disabled = true;
    users.push({
        email: email.value,
        password: password.value,
    });
    await setItem('users', JSON.stringify(users));
    resetForm();
}

/**
 * This function clears the input fields from the register form
 */
function resetForm() {
    email.value = '';
    password.value = '';
    registerBtn.disabled = false;
}