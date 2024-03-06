package main

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

var userName = "DragonWarrior"

var clients = make(map[*websocket.Conn]bool)

type Message struct {
	Type string `json:"type"`
	Name string `json:"name"`
}

func main() {
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	//http.HandleFunc("/register", results)

	http.HandleFunc("/echo", func(w http.ResponseWriter, r *http.Request) {
		conn, _ := upgrader.Upgrade(w, r, nil)

		msg := Message{
			Type: "username",
			Name: userName,
		}
		msgJSON, err := json.Marshal(msg)
		if err != nil {
			fmt.Println("Error marshalling message:", err)
			return
		}

		err = conn.WriteMessage(websocket.TextMessage, msgJSON)
		if err != nil {
			fmt.Println("Error sending message to client:", err)
			return
		}

		clients[conn] = true

		defer func() {
			delete(clients, conn)
			conn.Close()
		}()

		for {
			msgType, msg, err := conn.ReadMessage()
			if err != nil {
				return
			}

			var receivedMsg Message
			err = json.Unmarshal(msg, &receivedMsg)
			if err != nil {
				fmt.Println("Error unmarshalling message:", err)
				return
			}

			fmt.Printf("%s send: %s\n", conn.RemoteAddr(), receivedMsg.Name)

			msgJSON, err := json.Marshal(Message{
				Type: "message",
				Name: receivedMsg.Name,
			})
			if err != nil {
				fmt.Println("Error marshalling message:", err)
				return
			}

			for client := range clients {
				if client != conn {
					if err = client.WriteMessage(msgType, msgJSON); err != nil {
						return
					}
				}
			}
		}

	})

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "static/index.html")
		
	})

	fmt.Println("Server is running at: http://localhost:4040")
	http.ListenAndServe("localhost:4040", nil)
}
