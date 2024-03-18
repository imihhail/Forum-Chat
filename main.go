package main

import (
	"encoding/json"
	"fmt"
	"forum/gofiles"
	"net/http"

	"github.com/gorilla/websocket"
)

func main() {
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	http.HandleFunc("/sessionCheck", gofiles.CheckSession)
	http.HandleFunc("/login", gofiles.HandleLogin)
	http.HandleFunc("/logout", gofiles.Logout)
	http.HandleFunc("/register", gofiles.HandleRegister)
	http.HandleFunc("/posts", gofiles.HandlePosts)
	http.HandleFunc("/showposts", gofiles.ShowPosts)
	http.HandleFunc("/postcomment", gofiles.PostComment)
	http.HandleFunc("/showcomments", gofiles.ShowComments)
	http.HandleFunc("/likes", gofiles.Likes)
	http.HandleFunc("/echo", gofiles.WebSocket) 
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "static/index.html")
	})

	fmt.Println("Server is running at: http://localhost:4040")
	http.ListenAndServe("localhost:4040", nil)
}

func SendUsers(conn *websocket.Conn, registeredUsers []string) {
	registeredUsersJSON, _ := json.Marshal(registeredUsers)

	if err := conn.WriteMessage(websocket.TextMessage, registeredUsersJSON); err != nil {
		fmt.Println("write:", err)
		return
	}
}
