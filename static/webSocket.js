let displayUser = document.createElement('p')
export function webSocketServer(){
    let socket = new WebSocket("ws://localhost:4040/echo")

    socket.onopen = () => console.log("Successfully connected!");
    socket.onclose = (e) => console.log("Socket closed connection:", e);

    socket.onmessage = function(event) {
        let data = JSON.parse(event.data);
        if (data.type === 'username') {
            displayUser.innerHTML = data.name;
        } else {
            appendMessageToUI(data.name);
        }
    }
    
    socket.onerror = (error) => console.log("Socket error:", error);
   
    function appendMessageToUI(message) {
        const allMessages = document.querySelector('.allMessages');
        const msgOutput = document.createElement('p');
        msgOutput.innerHTML = `${displayUser.innerHTML}: ${message}`
        allMessages.appendChild(msgOutput);
    }

    
    document.body.appendChild(displayUser)

    let chatWindowContainer = document.createElement('div')
    chatWindowContainer.className = 'chatWindowContainer'

    let allMessages = document.createElement('div')
    allMessages.className = 'allMessages'
    allMessages.style.overflow = 'auto'

    let textArea = document.createElement('div')
    textArea.className = 'textArea'

    let typeBox = document.createElement('textarea')
    typeBox.style.resize = 'none'
 
    let sendMsgButton = document.createElement('button')
    sendMsgButton.className = 'sendMsgButton'
    sendMsgButton.innerHTML = 'Send'

    chatWindowContainer.appendChild(allMessages)
    textArea.appendChild(typeBox)
    textArea.appendChild(sendMsgButton)
    chatWindowContainer.appendChild(textArea)
    document.body.appendChild(chatWindowContainer)

    sendMsgButton.addEventListener('click', createMsg);

    function createMsg(){
        let typeBox = document.querySelector('textarea')
        let allMessages = document.querySelector('.allMessages')
        let msgOutput = document.createElement('p')
        msgOutput.innerHTML = `${displayUser.innerHTML}: ${typeBox.value}`
    
        let msg = JSON.stringify({
            type: "message",
            name: typeBox.value
        });
    
        socket.send(msg)
        allMessages.appendChild(msgOutput)
    }
    
}
