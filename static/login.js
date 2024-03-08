export function login() {
    let loginForm = document.createElement('form');
    loginForm.className = 'registerWindow';

    let userNameInput = document.createElement('input');
    userNameInput.setAttribute('placeholder', 'Username/e-mail');
    userNameInput.required = true;
    loginForm.appendChild(userNameInput);

    let passWordInput = document.createElement('input');
    passWordInput.setAttribute('type', 'password');
    passWordInput.setAttribute('placeholder', 'Password');
    passWordInput.required = true;
    loginForm.appendChild(passWordInput);   

    let registerButton = document.createElement('button');
    registerButton.innerHTML = 'Login';
    registerButton.type = 'submit';
    loginForm.appendChild(registerButton);

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        let userName = userNameInput.value;
        let passWord = passWordInput.value;     

        fetch('http://localhost:4040/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username: userName, password: passWord}),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Username:', data.username);
            console.log('Status:', data.errormsg);
            if (data.errormsg != '') {
                alert(data.errormsg)
            } else {
                let currentUser = document.createElement('p')
                currentUser.style.float = 'right'
                currentUser.innerHTML = data.username
                document.body.appendChild(currentUser)
                loginForm.remove()
            }
        })
        .catch((error) => {
        console.error('Error:', error);
        });
    });

    document.body.appendChild(loginForm);
}