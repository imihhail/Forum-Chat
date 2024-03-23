package gofiles

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

var clients = make(map[string]*websocket.Conn)
var OnlineUsers []string

func WebSocket(w http.ResponseWriter, r *http.Request) {
	registeredUsers := ShowUsers(returnUser(r))

	conn, _ := upgrader.Upgrade(w, r, nil)

	clients[returnUser(r)] = conn

	defer func() {
		delete(clients, returnUser(r))
		conn.Close()
		updateOnlineUsers()
	}()

	OnlineUsers = nil

	SendUsers(conn, registeredUsers)
	updateOnlineUsers()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			return
		}

		var message struct {
			MsgSender   string `json:"msgSender"`
			MsgReciever string `json:"msgReciever"`
			Type        string `json:"type"`
			SentMsg     string `json:"sentMsg"`
			Time        string `json:"time"`
		}

		err = json.Unmarshal(msg, &message)
		if err != nil {
			fmt.Println("error decoding message:", err)
			continue
		}

		saveChat, err := Db.Prepare("insert into PRIVATEMESSAGES (MSGSENDER, MSGRECIEVER, TEXTMSG, TIME) values (?, ?, ?, ?)")
		if err != nil {
			fmt.Println("Error retrieving textmessage")
			return
		}

		_, err = saveChat.Exec(message.MsgSender, message.MsgReciever, message.SentMsg, message.Time)
		if err != nil {
			fmt.Println("Error saving piravemessage into database")
			return
		}

		if client, ok := clients[message.MsgReciever]; ok {
			client.WriteMessage(websocket.TextMessage, msg)
		} else {
			fmt.Print("")
		}

		registeredUsers := ShowUsers(returnUser(r))
		SendUsers(conn, registeredUsers)
		updateOnlineUsers()

		// Update userlist order after recieving message
		if clients[message.MsgReciever] != nil {
			registeredUsers = ShowUsers(message.MsgReciever)
			SendUsers(clients[message.MsgReciever], registeredUsers)
			updateOnlineUsers()
		}
	}
}

func SendUsers(conn *websocket.Conn, registeredUsers []AllUsers) {
	var Data struct {
		Type  string     `json:"type"`
		Users []AllUsers `json:"registeredusers"`
	}

	Data.Type = "registered"
	Data.Users = append(Data.Users, registeredUsers...)
	registeredUsersJSON, _ := json.Marshal(Data)

	if err := conn.WriteMessage(websocket.TextMessage, registeredUsersJSON); err != nil {
		fmt.Println("write1:", err)
		return
	}
}

func SendOnlineUsers(conn *websocket.Conn) {
	var Data struct {
		Type  string   `json:"type"`
		Users []string `json:"onlineUsers"`
	}

	Data.Type = "onlineUsers"
	Data.Users = OnlineUsers

	onlineUsersJSON, _ := json.Marshal(Data)

	if err := conn.WriteMessage(websocket.TextMessage, onlineUsersJSON); err != nil {
		fmt.Println("write2:", err)
		return
	}
}

func updateOnlineUsers() {
	OnlineUsers = nil
	for _, user := range sessions {
		OnlineUsers = append(OnlineUsers, user)
	}
	
	for _, conn := range clients {
		SendOnlineUsers(conn)
	}
}

func returnUser(r *http.Request) string {
	Cookie, err := r.Cookie("session_token")

	if err != nil {
		fmt.Println("Error sending cookie")
		return ""
	}
	return sessions[Cookie.Value]
}
