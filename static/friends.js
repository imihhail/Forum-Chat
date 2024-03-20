export function displayFriends(sidebar, loggedInUser) {
    let usersDiv = document.createElement('div')
    let socket = new WebSocket("ws://localhost:4040/echo")
       
    socket.onopen = () => console.log("Websocket connected!")

    socket.onmessage = function(event) {       
        let data = JSON.parse(event.data)

        if (data.type == 'message') {
            let allMessages = document.querySelector(`[room=${data.msgReciever}-${data.msgSender}]`)
            if (allMessages != null)
            appendMessageToUI(data.sentMsg, data.msgSender, data.msgReciever)
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
        
    function appendMessageToUI(message, sender, reciever) {
        let allMessages = document.querySelector(`[room=${reciever}-${sender}]`)
        console.log(allMessages);
        const msgOutput = document.createElement('p');
        msgOutput.innerHTML = `<b>${sender}</b><br> ${message}`
        allMessages.appendChild(msgOutput);
       /*WORKING!*/ //let header = document.querySelector('header')
       /*WORKING!*/ //header.innerHTML = 'New message!'
    }
}

function openChat(msgSender, msgReciever, socket) {
    let requestChatHistory = {
        msgsender : msgSender,
        msgreciever : msgReciever
    }

    fetch('http://localhost:4040/chathistory', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(requestChatHistory)
    })
    .then(response => response.json())
    .then(data => {
        const allMessages = document.querySelector('.allMessages');
        for(let i = 0 ; i < data.length ; i++) {
            const msgOutput = document.createElement('p');
            msgOutput.innerHTML = `<b>${data[i].Sender}</b><br> ${data[i].Text}`
            allMessages.appendChild(msgOutput);
        }   
    })
    .catch((error) => {
        console.error('Error from chathistory:', error);
    })

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
        let typeBox = document.querySelector('.sentText').value
        const msgOutput = document.createElement('p')

        msgOutput.innerHTML = `<b>${msgSender}</b><br> ${typeBox}`
        allMessages.appendChild(msgOutput);
     
        let msg = JSON.stringify({
            msgSender: msgSender,
            msgReciever: msgReciever,
            type: "message",
            sentMsg: typeBox
        })
        socket.send(msg)
    }
}

