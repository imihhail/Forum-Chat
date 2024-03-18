export function displayFriends(sidebar, loggedInUser) {
    let usersDiv = document.createElement('div')
    let socket = new WebSocket("ws://localhost:4040/echo")
       
    socket.onopen = (e) => console.log("Websocket connected!")
    socket.onmessage = function(event) {    
        let data = JSON.parse(event.data)

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
                AllUsers.addEventListener('click', () => openChat(loggedInUser, AllUsers.textContent))
                usersDiv.appendChild(AllUsers)
            }
        }
        sidebar.appendChild(usersDiv)
       // appendMessageToUI(event.data);        
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
    //socket.onclose = () => fetch('/logout')
    
    function appendMessageToUI(message) {
        const allMessages = document.querySelector('.allMessages');
        const msgOutput = document.createElement('p');
        msgOutput.innerHTML = `${loggedInUser}: ${message}`
        allMessages.appendChild(msgOutput);
       // let header = document.querySelector('header')
       // header.innerHTML = 'New message!'
    }


}

function openChat(msgSender, msgReciever) {
    console.log(msgSender, msgReciever)

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
    
        let msg = typeBox
        socket.send(msg)
       // allMessages.appendChild(msgOutput)
    }
}

