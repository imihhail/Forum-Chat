export function displayFriends(sidebar, loggedInUser) {
    let usersDiv = document.createElement('div')
    let socket = new WebSocket("ws://localhost:4040/echo")
       
    socket.onopen = () => console.log("Websocket connected!")
    
    socket.onmessage = function(event) {       
        let data = JSON.parse(event.data)

        if (data.type == 'message') {
            let allMessages = document.querySelector(`[room=${data.msgReciever}-${data.msgSender}]`)

            //Dont append msg to chatbox if chatbox is not opened and send notification
            if (allMessages != null){
                 appendMessageToUI(data.sentMsg, data.msgSender, data.msgReciever, data.time)
            } else {
                setTimeout(() =>{
                    let notify = document.querySelector(`[user=${data.msgSender}]`);
                    let colors = ['orange','hsl(0, 0%, 25%)']
                    let i = 0
                         let intervalId = setInterval(() => {
                            notify.style.backgroundColor = colors[i % colors.length]
                            i++
                        }, 300)
                    
                        setTimeout(() => {
                            clearInterval(intervalId)
                            notify.style.backgroundColor = 'hsl(0, 0%, 25%)'
                        }, 3000)
                },100)
            }  
        }

        if (data.type == 'onlineUsers') {
            let registeredUsers = document.querySelectorAll('.registered')
            registeredUsers.forEach(user => data.onlineUsers.includes(user.textContent) ? user.style.opacity = '1' : user.style.opacity = '0.5')
        }

        if (data.type == 'registered'){
            data.registeredusers != null ? usersDiv.innerHTML = '' : socket.send('{}')

            for (let i = 0 ; i < data.registeredusers.length ; i++) {
                let registeredUsers = document.createElement('p')
                registeredUsers.className = 'registered'
                registeredUsers.setAttribute('user', data.registeredusers[i].Username)
                registeredUsers.innerHTML = data.registeredusers[i].Username
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
        msgOutput.className = 'privatemessage'
        msgOutput.innerHTML = `<b>${sender}</b> <span class = "timespan">${time}</span> <br> ${message}`
        allMessages.prepend(msgOutput);
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
            const msgOutput = document.createElement('p')
            msgOutput.className = 'privatemessage'
            msgOutput.innerHTML = `<b>${data[i].Sender}</b> <span class = "timespan">${data[i].Time}</span><br> ${data[i].Text}`
            allMessages.append(msgOutput)
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

    let postDiv = document.createElement('div')
    postDiv.className = 'chatbox'
    
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
        const scrollDirection = e.deltaY < 0 ? 1 : 0;
        if (scrollDirection === 1) {
            loadMoreMessages(msgSender, msgReciever, time);
        }
    });
    
    let textArea = document.createElement('div')
    textArea.className = 'textArea'

    let typeBox = document.createElement('textarea')
    typeBox.className = "sentText"
    typeBox.style.resize = 'none'
    typeBox.style.width = '100%'
 
    let sendMsgButton = document.createElement('button')
    sendMsgButton.type = 'submit'
    sendMsgButton.className = 'sendMsgButton'
    sendMsgButton.innerHTML = `<b>Send</b>`

    chatWindowContainer.appendChild(closeButton)
    postDiv.appendChild(allMessages)
    textArea.appendChild(typeBox)
    textArea.appendChild(sendMsgButton)
    postDiv.appendChild(textArea)
    chatWindowContainer.appendChild(postDiv)
    document.body.appendChild(chatWindowContainer)
    sendMsgButton.addEventListener('click', createMsg)

    function createMsg(){
        let currentTime = new Date();
        let month = (currentTime.getMonth() + 1).toString().padStart(2, '0');
        let hours = currentTime.getHours().toString().padStart(2, '0');
        let minutes = currentTime.getMinutes().toString().padStart(2, '0');
        let seconds = currentTime.getSeconds().toString().padStart(2, '0');
        let formattedTime = currentTime.getDate() + "/" + month + "/" + currentTime.getFullYear() + " " + hours + ":" + minutes + ":" + seconds
        
        let typeBox = document.querySelector('.sentText').value
        const msgOutput = document.createElement('p')
        msgOutput.className = 'privatemessage'

        msgOutput.innerHTML = `<b>${msgSender}</b> <span class = "timespan">${formattedTime}</span><br> ${typeBox}`
        allMessages.prepend(msgOutput)
     
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
var upDateReciever

function loadMoreMessages(msgSender, msgReciever, time) {
    upDateReciever = msgReciever
    document.body.style.cursor = 'wait'
    start++
    if (start == 1){
        setInterval(() => {
            counDown--
            if (counDown == 0){
                loadmessages += 10
                requestChatHistory(msgSender, upDateReciever, loadmessages, time)
                document.body.style.cursor = 'default'               
            }
        },loadTime)
    }
    counDown = 2
    loadTime = 500
}
