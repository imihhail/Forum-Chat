import { router } from './router.js';

let userNameInput
let passWordInput

let app = document.getElementById('app')
let header = document.querySelector('header')
let loginForm = document.createElement('form');
loginForm.className = 'loginWindow';

export function login() {
    let loginLink = document.createElement('a');
    loginLink.innerHTML = `<b>Register</b>`;
    header.appendChild(loginLink);

    loginLink.addEventListener('click', function(event){
        event.preventDefault();
        loginForm.innerHTML = ''
        router('/register');
        loginLink.remove()
    });

    userNameInput = document.createElement('input');
    userNameInput.setAttribute('placeholder', 'Username/e-mail');
    userNameInput.required = true;
    loginForm.appendChild(userNameInput)

    passWordInput = document.createElement('input');
    passWordInput.setAttribute('type', 'password');
    passWordInput.setAttribute('placeholder', 'Password');
    passWordInput.required = true;
    loginForm.appendChild(passWordInput);   

    let registerButton = document.createElement('button')
    registerButton.innerHTML = `<b>Login</b>`
    registerButton.type = 'submit'
    loginForm.appendChild(registerButton);

    loginForm.removeEventListener('submit', handleSubmit);
    loginForm.addEventListener('submit', handleSubmit);

    app.appendChild(loginForm)
}

function handleSubmit(event) {
    event.preventDefault();

    let userName = userNameInput.value
    let passWord = passWordInput.value

    fetch('http://localhost:4040/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({username: userName, password: passWord}),
    })
    .then(response => response.json())
    .then(data => {
        if (data.errormsg != '') {
            alert(data.errormsg)
        } else {
            loginForm.innerHTML = ''
            router('/home', data.username);
        }
    })
    .catch((error) => {
    console.error('Error:', error)
    })
}