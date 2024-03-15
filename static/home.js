import { router } from './router.js';

let loggedInUser

let app = document.getElementById('app')
let header = document.querySelector('header')

let mainContent = document.createElement('div')
mainContent.className = 'maincontent'

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
        mainContent.innerHTML = ''
        fetch('/logout')
        router('/login')
    })
    header.appendChild(logOut)
    
    postsBody()
    showPosts()
    createSideBar()
}

function postsBody() {
    let userPostInput = document.createElement('div')
    userPostInput.className = 'userPostInput'

    var categoriePicker = document.createElement("form");
    categoriePicker.className = "categoriePicker";
    categoriePicker.innerHTML = `
        <div>
            <input type="checkbox" value="Pictures">
            <label for="Pictures">Pictures</label>
            <input type="checkbox" value="Memes">
            <label for="Memes">Memes</label>
            <input type="checkbox" value="Code">
            <label for="Code">Code</label>
            <input type="checkbox" value="Misc">
            <label for="Misc">Misc</label>
        </div>
        <div>
            <textarea id="text-input" rows="5" class="form-control" required></textarea>
        </div>
        <button type="submit"><b>Submit</b></button>
    `
    categoriePicker.addEventListener('submit', HandlePosts)

    userPostInput.appendChild(categoriePicker)
    mainContent.appendChild(userPostInput)
}

function HandlePosts(event) {
    event.preventDefault()

    let checkboxes = document.querySelectorAll('input[type=checkbox]')
    var isAtLeastOneChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);

    if (!isAtLeastOneChecked) {
        alert('Please check at least one category.')
        return
    }

    let postText = document.querySelector('textarea').value
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
            postDiv.setAttribute('postcreator', data[i].AllUsers)
            postDiv.setAttribute('Pictures', data[i].Cat1)
            postDiv.setAttribute('Memes', data[i].Cat2)
            postDiv.setAttribute('Code', data[i].Cat3)
            postDiv.setAttribute('Misc', data[i].Cat4)
            let postLikers =  data[i].PostUsernames[i]
            if (postLikers != null) {
                postLikers.forEach(liker =>{
                    postDiv.setAttribute(liker, liker)  
                })
            }
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
                postDiv.setAttribute(loggedInUser, loggedInUser)
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
                postDiv.removeAttribute(loggedInUser)
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
    mainContent.appendChild(postsCointainer)
    app.appendChild(mainContent)
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
            if (i == 0) {postDiv.id = 'firstComment'}
            
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

            likeImg.addEventListener('click', function(){
                let Likedata = {
                    likedPostId: data[i].AllCommentIDs[0],
                    likechoice: 'commentLike',
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
                    likedPostId: data[i].AllCommentIDs[0],
                    likechoice: 'commentDislike',
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
    allComments.style.marginTop = '0.2vh'

    let submitDiv = document.createElement('div')
    submitDiv.style.display = 'flex'
    submitDiv.style.width = '100%'

    let commentArea = document.createElement('textarea')
    commentArea.style.width = '100%'
    submitDiv.appendChild(commentArea)

    let closeButton = document.createElement('div')
    closeButton.innerHTML = '&times;'
    closeButton.className = 'closeButton'
    closeButton.addEventListener('click', function(){
        commentForm.remove()
    })

    let commentButton = document.createElement('button')
    commentButton.innerHTML = `<b>Comment</b>`
    commentButton.type = 'submit'

    submitDiv.appendChild(commentButton)
    commentForm.appendChild(closeButton)    
    commentForm.appendChild(allComments)
    commentForm.appendChild(submitDiv)
    app.appendChild(commentForm)

    commentForm.addEventListener('submit', function(event){
        event.preventDefault()
        postComment(postID, commentArea.value)
        commentArea.value = ''
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
    let commentCreated = 1
    handleComments(postID, commentCreated)
}

function createSideBar() {
    let sidebar = document.createElement('div')

    let closeButton = document.createElement('div')
    closeButton.innerHTML = '&times;'
    closeButton.className = 'sidecloseButton'
    

    sidebar.className = 'sidebar'
    sidebar.innerHTML = `
    <nav class="navbar">
    <ul>
        <li><p class = "allposts" >All posts</p></li>
        <li><p class = "myposts" >My posts</p></li>
        <li><p class = "mylikes" >My liked posts</p></li>
        <li><p class = "Pictures" >Pictures</p></li>
        <li><p class = "Memes" >Memes</p></li>
        <li><p class = "Code" >Code</p></li>
        <li><p class = "Misc" >Misc</p></li>
    </ul>
    </nav>
    `
    sidebar.prepend(closeButton)
    app.prepend(sidebar)
    
    document.querySelector('.allposts').addEventListener('click', () =>{
        let displayAllPosts = document.querySelectorAll('.postDiv')
        displayAllPosts.forEach(e => e.style.display = '')
    })
    
    document.querySelector('.myposts').addEventListener('click', () => {
        let hidePosts = document.querySelectorAll('.postDiv')
        hidePosts.forEach(post => post.style.display = 'none')

        let displayCreatedPosts = document.querySelectorAll(`.postDiv[postcreator="${loggedInUser}"]`)
        displayCreatedPosts.forEach(post => post.style.display = '')
    })

    let likes = document.querySelector('.mylikes')
    likes.addEventListener('click', () => filterPosts(likes))

    let cat1 = document.querySelector('.Pictures')
    cat1.addEventListener('click', () => filterPosts(cat1))

    let cat2 = document.querySelector('.Memes')
    cat2.addEventListener('click', () => filterPosts(cat2))
    
    let cat3 = document.querySelector('.Code')
    cat3.addEventListener('click', () => filterPosts(cat3))

    let cat4 = document.querySelector('.Misc')
    cat4.addEventListener('click', () => filterPosts(cat4))
}

// Filter categories and my liked posts
function filterPosts(filterChoice) {
    let hidePosts = document.querySelectorAll('.postDiv')
    hidePosts.forEach(post => post.style.display = 'none')

    let filteredPosts 
    filterChoice.textContent == 'My liked posts' ? filteredPosts = loggedInUser : filteredPosts = filterChoice.textContent

    let displayFilteredPosts = document.querySelectorAll(`.postDiv[${filteredPosts}="${filteredPosts}"]`)
    displayFilteredPosts.forEach(post => post.style.display = '')
}
