import { login } from './login.js';

export function registration() {
    let registerForm = document.createElement('form');
    registerForm.className = 'registerWindow';

    let emailInput = document.createElement('input');
    emailInput.setAttribute('type', 'email');
    emailInput.setAttribute('placeholder', 'E-mail');
    emailInput.required = true;
    registerForm.appendChild(emailInput);

    let userNameInput = document.createElement('input');
    userNameInput.setAttribute('placeholder', 'Username');
    userNameInput.required = true;
    registerForm.appendChild(userNameInput);

    let passWordInput = document.createElement('input');
    passWordInput.setAttribute('type', 'password');
    passWordInput.setAttribute('placeholder', 'Password');
    passWordInput.required = true;
    registerForm.appendChild(passWordInput);

    let firstNameInput = document.createElement('input');
    firstNameInput.setAttribute('placeholder', 'First Name');
    firstNameInput.required = true;
    registerForm.appendChild(firstNameInput);

    let lastNameInput = document.createElement('input');
    lastNameInput.setAttribute('placeholder', 'Last Name');
    lastNameInput.required = true;
    registerForm.appendChild(lastNameInput);

    let genderInput = document.createElement('select');
    genderInput.innerHTML = `
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="other">Other</option>
    `;
    genderInput.required = true;
    registerForm.appendChild(genderInput);

    let ageInput = document.createElement('input');
    ageInput.setAttribute('type', 'number');
    ageInput.setAttribute('placeholder', 'Age');
    ageInput.required = true;
    registerForm.appendChild(ageInput);

    let registerButton = document.createElement('button');
    registerButton.innerHTML = 'Register';
    registerButton.type = 'submit';
    registerForm.appendChild(registerButton);

    registerForm.addEventListener('submit', function(event) {
        event.preventDefault();

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
            console.log('Username:', data.username);
            console.log('Status:', data.errormsg);
            if (data.errormsg != '') {
                alert(data.errormsg)
            } else {
                registerForm.remove()
                login()
            }
        })
        .catch((error) => {
        console.error('Error:', error);
        });
    });

    document.body.appendChild(registerForm);
}
