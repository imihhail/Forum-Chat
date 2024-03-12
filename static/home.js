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
    showPosts()
}

function postsBody() {
    let userPostInput = document.createElement('div')
    userPostInput.className = 'userPostInput'

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
            <textarea id="text-input" rows="5" class="form-control" required></textarea>
        </div>
        <button type="submit"><b>Submit</b></button>
    `
   // categoriePicker.removeEventListener('submit', HandlePosts)
    categoriePicker.addEventListener('submit', HandlePosts)

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
    let postFromUser = 1
    showPosts(postFromUser)
}

function showPosts(postFromUser) {
    let postsCointainer = document.createElement('div')
    postsCointainer.id = 'postsCointainer'

    fetch('/showposts')
    .then(response => response.json())
    .then(data => {
        let start = 0
        postFromUser == 1? start = data.length - 1 : start = 0

        for(let i = start ; i < data.length ; i++){
            let postDiv = document.createElement('div')
            postDiv.className = 'postDiv'

            let postCreator = document.createElement('p')
            postCreator.innerHTML = `<b>${data[i].AllUsers}:</b>`
            postCreator.style.marginBottom = '2vh'
            postDiv.appendChild(postCreator)

            let post = document.createElement('p')
            post.innerHTML = data[i].AllPosts
            postDiv.appendChild(post)

            let likeSection = document.createElement('div')
            likeSection.style.display = 'flex'
            likeSection.style.marginTop = '2vh'

            let likeImg = document.createElement('img')
            likeImg.src = 'static/pictures/like.png'
            likeImg.style.width = '2.5vh'

            likeImg.addEventListener('click', function(){
                let Likedata = {
                    likedPostId: data[i].AllPostIDs[0],
                    likechoice: 'like',
                    userID : loggedInUser
                }
                
                fetch('http://localhost:4040/likes', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json',},
                    body: JSON.stringify(Likedata)
                })
                .then(response => response.json())
                .then(data => {
                    likeCount.innerHTML = data.likeCountAfterLike
                    dislikeCount.innerHTML = data.disLikeCountAfterLike
                })
            })
            likeSection.appendChild(likeImg)

            let likeCount = document.createElement('p')
            likeCount.innerHTML = data[i].LikeCount
            likeCount.style.marginRight = '1vh'
            likeSection.style.position = 'relative';
            likeSection.appendChild(likeCount)

            let dislikeImg = document.createElement('img')
            dislikeImg.src = 'static/pictures/dislike.png' 
            dislikeImg.style.width = '2.5vh'

            dislikeImg.addEventListener('click', function(){
                let Likedata = {
                    likedPostId: data[i].AllPostIDs[0],
                    likechoice: 'dislike',
                    userID : loggedInUser
                }
                
                fetch('http://localhost:4040/likes', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json',},
                    body: JSON.stringify(Likedata)
                })
                .then(response => response.json())
                .then(data => {
                    likeCount.innerHTML = data.likeCountAfterLike
                    dislikeCount.innerHTML = data.disLikeCountAfterLike
                })
            })
            likeSection.appendChild(dislikeImg)

            let dislikeCount = document.createElement('p')
            dislikeCount.innerHTML = data[i].DisLikeCount
            likeSection.appendChild(dislikeCount)

            let showComments = document.createElement('p')
            showComments.innerHTML = `<u>Show Comments (0)</u>`
            showComments.style.position = 'absolute';
            showComments.style.right = '0';
            showComments.style.bottom = '0';
            showComments.addEventListener('click', () => handleComments(data[i].AllPostIDs))

            likeSection.appendChild(showComments)
            postDiv.appendChild(likeSection)
            postsCointainer.appendChild(postDiv)          
        }
    })
    app.appendChild(postsCointainer)
}

function handleComments(postID, commentCreated) {
    fetch('http://localhost:4040/showcomments', {
        method: 'POST',
        headers: {'Content-Type': 'text/plain',},
        body: postID[0].toString()
    })
    .then(response => response.json())
    .then(data => {
        let start = 0
        commentCreated == 1? start = data.length - 1 : start = 0

        for(let i = start ; i < data.length ; i++) {
            let currentAllComments = document.getElementById(postID[0])
            let postDiv = document.createElement('div')
            postDiv.className = 'postDiv'
            postDiv.id = 'commentCounter'

            let postCreator = document.createElement('p')
            postCreator.innerHTML = `<b>${data[i].AllComments}:</b>`
            postCreator.style.marginBottom = '2vh'
            postDiv.appendChild(postCreator)

            let post = document.createElement('p')
            post.innerHTML = data[i].AllUsers
            postDiv.appendChild(post)

            let likeSection = document.createElement('div')
            likeSection.style.display = 'flex'
            likeSection.style.marginTop = '2vh'

            let likeImg = document.createElement('img')
            likeImg.src = 'static/pictures/like.png'
            likeImg.style.width = '2.5vh'
            likeSection.appendChild(likeImg)

            let likeCount = document.createElement('p')
            likeCount.innerHTML = '0'
            likeCount.style.marginRight = '1vh'
            likeSection.style.position = 'relative';
            likeSection.appendChild(likeCount)

            let dislikeImg = document.createElement('img')
            dislikeImg.src = 'static/pictures/dislike.png' 
            dislikeImg.style.width = '2.5vh'
            likeSection.appendChild(dislikeImg)

            let dislikeCount = document.createElement('p')
            dislikeCount.innerHTML = '0'
            likeSection.appendChild(dislikeCount)
            
            postDiv.appendChild(likeSection)
            currentAllComments.appendChild(postDiv)
        }
    })

    if (commentCreated != 1) {
    let commentForm = document.createElement('form')
    commentForm.className = 'commendDiv' 
    commentForm.style.display = 'flex'
    commentForm.style.flexDirection = 'column'
    commentForm.style.justifyContent = 'space-between'

    let allComments = document.createElement('div')
    allComments.id = postID[0]
    allComments.style.overflow = 'auto'
    allComments.style.marginBottom = '2vh'
 
    let usersPost = document.createElement('h1')
    usersPost.innerHTML = 'Comments:'
    commentForm.appendChild(usersPost)

    let submitDiv = document.createElement('div')
    submitDiv.style.display = 'flex'
    submitDiv.style.width = '100%'

    let commentArea = document.createElement('textarea')
    commentArea.style.width = '100%'
    submitDiv.appendChild(commentArea)

    let commentButton = document.createElement('button')
    commentButton.innerHTML = `<b>Comment</b>`
    commentButton.type = 'submit'
    submitDiv.appendChild(commentButton)

    commentForm.appendChild(allComments)
    commentForm.appendChild(submitDiv)
    app.appendChild(commentForm)

    commentForm.addEventListener('submit', function(event){
        event.preventDefault()
        postComment(postID, commentArea.value)
    })
}
}

function postComment(postID, comment) {
    let Commentdata = {
        postid: postID[0],
        usercomment: comment,
        username : loggedInUser
    }

    fetch('http://localhost:4040/postcomment', {
        method: 'POST',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify(Commentdata)
    })
    let allCommentsCount = document.querySelectorAll('#commentCounter').length + 1
    let commentCreated = 1
    handleComments(postID, commentCreated)
}
