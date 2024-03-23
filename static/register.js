import { router } from './router.js';

let emailInput
let userNameInput
let passWordInput  
let firstNameInput
let lastNameInput
let genderInput
let ageInput

let header = document.querySelector('header')
let registerForm = document.createElement('form');
registerForm.className = 'registerWindow';
let contex = document.getElementById('app')

export function CheckSession() {
    fetch('/sessionCheck')
    .then(response => response.text())
    .then(username => username != '' ? router('/home', username) : registration())
}

export function registration() {
    header.style.justifyContent = 'end'

    let loginLink = document.createElement('a');
    loginLink.innerHTML = `<b>Login</b>`
    header.appendChild(loginLink)

    loginLink.addEventListener('click', function(event){
        registerForm.innerHTML = ''
        event.preventDefault()
        router('/login');
        loginLink.remove()
    });
    
    emailInput = document.createElement('input');
    emailInput.setAttribute('type', 'email');
    emailInput.setAttribute('placeholder', 'E-mail');
    emailInput.required = true;
    registerForm.appendChild(emailInput);

    userNameInput = document.createElement('input');
    userNameInput.setAttribute('placeholder', 'Username');
    userNameInput.required = true;
    registerForm.appendChild(userNameInput);

    passWordInput = document.createElement('input');
    passWordInput.setAttribute('type', 'password');
    passWordInput.setAttribute('placeholder', 'Password');
    passWordInput.required = true;
    registerForm.appendChild(passWordInput);

    firstNameInput = document.createElement('input');
    firstNameInput.setAttribute('placeholder', 'First Name');
    firstNameInput.required = true;
    registerForm.appendChild(firstNameInput);

    lastNameInput = document.createElement('input');
    lastNameInput.setAttribute('placeholder', 'Last Name');
    lastNameInput.required = true;
    registerForm.appendChild(lastNameInput);

    genderInput = document.createElement('select');
    genderInput.innerHTML = `
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="other">Other</option>
    `;
    genderInput.required = true;
    registerForm.appendChild(genderInput);

    ageInput = document.createElement('input');
    ageInput.setAttribute('type', 'number');
    ageInput.setAttribute('placeholder', 'Age');
    ageInput.required = true;
    registerForm.appendChild(ageInput);

    let registerButton = document.createElement('button');
    registerButton.innerHTML = `<b>Register</b>`;
    registerButton.type = 'submit';
    registerForm.appendChild(registerButton);

    registerForm.removeEventListener('submit', handleRegiser)
    registerForm.addEventListener('submit', handleRegiser) 

    contex.appendChild(registerForm);
}

function handleRegiser(event){
    event.preventDefault()

    let email = emailInput.value;
    let userName = userNameInput.value;
    let passWord = passWordInput.value;     
    let fName = firstNameInput.value;
    let lName = lastNameInput.value;
    let gender = genderInput.value;
    let age = ageInput.value;

    fetch('http://localhost:4040/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email: email, username: userName, password: passWord, firstname: fName, lastname: lName, gender: gender, age: age}),
    })
    .then(response => response.json())
    .then(data => {
        if (data.errormsg != '') {
            alert(data.errormsg)
        } else {
            registerForm.innerHTML = ''
            event.preventDefault();
            router('/login');
            document.querySelector('a').remove()
        }
    })
    .catch((error) => {
    console.error('Error:', error);
    })
}
