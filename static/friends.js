export function displayFriends(sidebar, loggedInUser) {
    let usersDiv = document.createElement('div')
    let socket = new WebSocket("ws://localhost:4040/echo")
       
    socket.onopen = () => console.log("Websocket connected!")

    socket.onmessage = function(event) {    
        let data = JSON.parse(event.data)
        if (data.type == 'message') {
            appendMessageToUI(data.sentMsg, data.msgSender);
        }

        if (data.type == 'onlineUsers') {
            let registeredUsers = document.querySelectorAll('.registered')
            registeredUsers.forEach(user => data.onlineUsers.includes(user.textContent) ? user.style.opacity = '1' : user.style.opacity = '0.5')
        }
        
        if (data.type == 'registered'){
            usersDiv.innerHTML = ''
            for (let i = 0 ; i < data.registeredusers.length ; i++) {
                let AllUsers = document.createElement('p')
                AllUsers.className = 'registered'
                AllUsers.innerHTML = data.registeredusers[i]
                AllUsers.style.color = 'white'
                AllUsers.style.opacity = '0.5'
                AllUsers.addEventListener('click', () => openChat(loggedInUser, AllUsers.textContent, socket))
                usersDiv.appendChild(AllUsers)
            }
        }
        sidebar.appendChild(usersDiv)    
    }
    
    socket.onerror = (error) => console.log("Socket error:", error)

    document.querySelector('.logout').addEventListener("click", () => {   
       fetch('/logout')
        .then(() => {
            socket.close();
         })
        .catch((error) => {
            console.error('Error:', error);
        });
    })
    //socket.onclose = () => 
    
    function appendMessageToUI(message, sender) {
        const allMessages = document.querySelector('.allMessages');
        const msgOutput = document.createElement('p');
        msgOutput.innerHTML = `${sender}: ${message}`
        allMessages.appendChild(msgOutput);
       //WORKING! let header = document.querySelector('header')
       //WORKING! header.innerHTML = 'New message!'
    }
}

function openChat(msgSender, msgReciever, socket) {
    let chatWindowContainer = document.createElement('div')
    chatWindowContainer.className = 'chatWindowContainer'

    let allMessages = document.createElement('div')
    allMessages.className = 'allMessages'
    allMessages.style.overflow = 'auto'

    let textArea = document.createElement('div')
    textArea.className = 'textArea'

    let typeBox = document.createElement('textarea')
    typeBox.className = "sentText"
    typeBox.style.resize = 'none'
 
    let sendMsgButton = document.createElement('button')
    sendMsgButton.className = 'sendMsgButton'
    sendMsgButton.innerHTML = 'Send'

    chatWindowContainer.appendChild(allMessages)
    textArea.appendChild(typeBox)
    textArea.appendChild(sendMsgButton)
    chatWindowContainer.appendChild(textArea)
    document.body.appendChild(chatWindowContainer)

    sendMsgButton.addEventListener('click', createMsg)

    function createMsg(){
        let typeBox = document.querySelector('.sentText').value
     
        //let allMessages = document.querySelector('.allMessages')
        //let msgOutput = document.createElement('p')
        //msgOutput.innerHTML = `${loggedInUser}: ${typeBox}`

        let msg = JSON.stringify({
            msgSender: msgSender,
            type: "message",
            sentMsg: typeBox
        });
        socket.send(msg)
       // allMessages.appendChild(msgOutput)
    }
}

