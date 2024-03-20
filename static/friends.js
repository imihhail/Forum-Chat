export function displayFriends(sidebar, loggedInUser) {
    let usersDiv = document.createElement('div')
    let socket = new WebSocket("ws://localhost:4040/echo")
       
    socket.onopen = () => console.log("Websocket connected!")

    socket.onmessage = function(event) {       
        let data = JSON.parse(event.data)

        if (data.type == 'message') {
            console.log(data)
            let allMessages = document.querySelector(`[room=${data.msgReciever}-${data.msgSender}]`)
            if (allMessages != null)
            appendMessageToUI(data.sentMsg, data.msgSender, data.msgReciever, data.time)
        }

        if (data.type == 'onlineUsers') {
            let registeredUsers = document.querySelectorAll('.registered')
            registeredUsers.forEach(user => data.onlineUsers.includes(user.textContent) ? user.style.opacity = '1' : user.style.opacity = '0.5')
        }
       
        if (data.type == 'registered'){
            if (data.registeredusers.length > 1) {usersDiv.innerHTML = ''}
                
            for (let i = 0 ; i < data.registeredusers.length ; i++) {
                let registeredUsers = document.createElement('p')
                registeredUsers.className = 'registered'
                registeredUsers.innerHTML = data.registeredusers[i]
                registeredUsers.style.color = 'white'
                registeredUsers.style.opacity = '0.5'
                registeredUsers.addEventListener('click', () => openChat(loggedInUser, registeredUsers.textContent, socket))
                usersDiv.appendChild(registeredUsers)
            }
        }
        sidebar.appendChild(usersDiv)    
    }
    
    document.querySelector('.logout').addEventListener("click", () => {   
       fetch('/logout')
        .then(() => {
            socket.close();
         })
        .catch((error) => {
            console.error('Error:', error);
        });
    })
    
    socket.onerror = (error) => console.log("Socket error:", error)

    socket.onclose = (e) => console.log("Socket closed",e);
        
    function appendMessageToUI(message, sender, reciever, time) {
        let allMessages = document.querySelector(`[room=${reciever}-${sender}]`)
        const msgOutput = document.createElement('p')
        msgOutput.innerHTML = `<b>${sender}</b> ${time} <br> ${message}`
        allMessages.appendChild(msgOutput);
       /*WORKING!*/ //let header = document.querySelector('header')
       /*WORKING!*/ //header.innerHTML = 'New message!'
    }
}

// Send chatroom users names to server and fetch theyr chathistory from them
// Loadmessages sets the amount of messages displayed. Scrolling up increases loadmessages by 10.
let loadmessages = 0
function requestChatHistory(msgSender, msgReciever, loadmessages) {
    loadmessages = loadmessages.toString()

    let requestChatHistory = {
        msgsender : msgSender,
        msgreciever : msgReciever,
        loadMessages: loadmessages
    }

    fetch('http://localhost:4040/chathistory', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(requestChatHistory)
    })
    .then(response => response.json())
    .then(data => {
        const allMessages = document.querySelector('.allMessages')

        for(let i = 0 ; i < data.length ; i++) {
            const msgOutput = document.createElement('p');
            msgOutput.innerHTML = `<b>${data[i].Sender}</b> ${data[i].Time}<br> ${data[i].Text}`
            allMessages.prepend(msgOutput);
        }   
    })
    .catch((error) => {
        console.error('Error from chathistory:', error);
    })
}

// Open chatroom and display theyr chathistory. Set loadmessages to 0 so it displays only last 10 messages 
function openChat(msgSender, msgReciever, socket, time) {
    loadmessages = 0
    requestChatHistory(msgSender, msgReciever, loadmessages, time)

    let chatWindowContainer = document.createElement('div')
    chatWindowContainer.className = 'chatWindowContainer'
    
    let closeButton = document.createElement('div')
    closeButton.innerHTML = '&times;'
    closeButton.className = 'closeButton'
    closeButton.addEventListener('click', () => {
        chatWindowContainer.remove()
    })

    let allMessages = document.createElement('div')
    allMessages.className = 'allMessages'
    allMessages.setAttribute('room', `${msgSender}-${msgReciever}`)
    allMessages.style.overflow = 'auto'

    allMessages.addEventListener("wheel", e => {
        const scrollDirection = e.deltaY < 0 ? 1 : 0
        if (scrollDirection === 1){loadMoreMessages(msgSender, msgReciever, time)}
    })

    let textArea = document.createElement('div')
    textArea.className = 'textArea'

    let typeBox = document.createElement('textarea')
    typeBox.className = "sentText"
    typeBox.style.resize = 'none'
 
    let sendMsgButton = document.createElement('button')
    sendMsgButton.className = 'sendMsgButton'
    sendMsgButton.innerHTML = `${msgReciever}`

    chatWindowContainer.appendChild(closeButton)
    chatWindowContainer.appendChild(allMessages)
    textArea.appendChild(typeBox)
    textArea.appendChild(sendMsgButton)
    chatWindowContainer.appendChild(textArea)
    document.body.appendChild(chatWindowContainer)
    sendMsgButton.addEventListener('click', createMsg)

    function createMsg(){
        let currentTime = new Date();
        let formattedTime = currentTime.getHours() + ":" + currentTime.getMinutes() + ":" + currentTime.getSeconds();

        let typeBox = document.querySelector('.sentText').value
        const msgOutput = document.createElement('p')

        msgOutput.innerHTML = `<b>${msgSender}</b> ${formattedTime}<br> ${typeBox}`
        allMessages.appendChild(msgOutput);
     
        let msg = JSON.stringify({
            type: "message",
            msgSender: msgSender,
            msgReciever: msgReciever,
            sentMsg: typeBox,
            time: formattedTime
        })
        socket.send(msg)
    }
}

let counDown = 1
let start = 0
let loadTime = 500

function loadMoreMessages(msgSender, msgReciever, time) {
    document.body.style.cursor = 'wait'
    start++
    if (start == 1){
        setInterval(() => {
            counDown--
            if (counDown == 0){
                loadmessages += 10
                requestChatHistory(msgSender, msgReciever, loadmessages, time)
                document.body.style.cursor = 'default'       
            }
        },loadTime)
    }
    counDown = 2
    loadTime = 500
}