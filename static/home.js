import { router } from './router.js';

let loggedInUser
let app = document.getElementById('app')
let header = document.querySelector('header')

export function home(username) {
    loggedInUser = username
    header.innerHTML = ''

    let currentUser = document.createElement('p')
    currentUser.innerHTML = `Logged in as: <b>${username}</b>`
    header.appendChild(currentUser)

    let logOut = document.createElement('p')
    logOut.innerHTML = 'Logout'
    logOut.style.marginLeft = '1vw'

    logOut.addEventListener('click', function(event) {
        event.preventDefault()
        header.innerHTML = ''
        fetch('/logout')
        router('/login')
    })
    header.appendChild(logOut)
    postsBody()
}

function postsBody() {
    let userPostInput = document.createElement('div')

    var categoriePicker = document.createElement("form");
    categoriePicker.className = "categoriePicker";
    categoriePicker.innerHTML = `
        <div>
            <input type="checkbox" id="Categorie1" value="Categorie1">
            <label for="Categorie1">Pictures</label>
            <input type="checkbox" id="Categorie2" value="Categorie2">
            <label for="Categorie2">Memes</label>
            <input type="checkbox" id="Categorie3" value="Categorie3">
            <label for="Categorie3">Code</label>
            <input type="checkbox" id="Categorie4" value="Categorie4">
            <label for="Categorie4">Misc</label>
        </div>
        <div>
            <textarea id="text-input" rows="5" class="form-control" placeholder="Type something..." required></textarea>
        </div>
        <button type="submit"><b>Submit</b></button>
    `
   // categoriePicker.removeEventListener('submit', HandlePosts);
    categoriePicker.addEventListener('submit', HandlePosts);

    userPostInput.appendChild(categoriePicker)
    app.appendChild(userPostInput)
}

function HandlePosts(event) {
    event.preventDefault()

    let postText = document.querySelector('textarea').value

    let checkboxes = document.querySelectorAll('input[type=checkbox]')
    let checkedCategories = Array.from(checkboxes).map(checkbox => checkbox.checked ? checkbox.value : '')

    let data = {
        text: postText,
        categories: checkedCategories,
        username : loggedInUser
    }

    fetch('http://localhost:4040/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
}

function showPosts() {

}

