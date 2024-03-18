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

var clients = make(map[*websocket.Conn]bool)
var OnlineUsers []string

func WebSocket(w http.ResponseWriter, r *http.Request) {
	registeredUsers := ShowUsers()

	conn, _ := upgrader.Upgrade(w, r, nil)

	clients[conn] = true

	defer func() {
		delete(clients, conn)
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

		fmt.Printf("%s send: %s\n", conn.RemoteAddr(), msg)
	
		for client := range clients {
			if err = client.WriteMessage(websocket.TextMessage, msg); err != nil {
				fmt.Println("write:", err)
				return
			}
		}
	}
}

func SendUsers(conn *websocket.Conn, registeredUsers []string) {
	var Data struct {
		Type  string   `json:"type"`
		Users []string `json:"registeredusers"`
	}

	Data.Type = "registered"
	Data.Users = append(Data.Users, registeredUsers...)
	registeredUsersJSON, _ := json.Marshal(Data)

	if err := conn.WriteMessage(websocket.TextMessage, registeredUsersJSON); err != nil {
		fmt.Println("write:", err)
		return
	}
}

func SendOnlineUsers(conn *websocket.Conn) {
	var Data struct {
		Type   string   `json:"type"`
		Users  []string `json:"onlineUsers"`
	}

	Data.Type = "onlineUsers"
	Data.Users = OnlineUsers

	onlineUsersJSON, _ := json.Marshal(Data)

	if err := conn.WriteMessage(websocket.TextMessage, onlineUsersJSON); err != nil {
		fmt.Println("write:", err)
		return
	}
}

func updateOnlineUsers() {
	OnlineUsers = nil
	for _, user := range sessions {
		OnlineUsers = append(OnlineUsers, user)
	}
	for client := range clients {
		SendOnlineUsers(client)
	}
}
