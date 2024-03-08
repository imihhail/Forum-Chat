package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"forum/endPoints"
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
	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		var user struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}

		err := json.NewDecoder(r.Body).Decode(&user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		var Authorized = false
		if r.Method == "POST" {
			// Get password and username from database if users inserted email exists in database.
			pw_userID_check := db.QueryRowContext(context.Background(), "SELECT ID, PASSWORD FROM people WHERE EMAIL = ? OR USERNAME = ?", user.Username, user.Username)
			fmt.Println(user.Username)
			fmt.Println(pw_userID_check)

			var db_password string
			var db_id string
			email_found := true
			var msgToClient = ""

			// If err != nil, then email is not found from database.
			if err := pw_userID_check.Scan(&db_id, &db_password); err != nil {
				fmt.Println(err)
				Authorized = false
				email_found = false
				msgToClient = "E-mail or username is not registered!"
				fmt.Println("ID1", db_id)
				fmt.Println("PW1", db_password)

			} else if user.Password != db_password && email_found {
				Authorized = false
				msgToClient = "Incorrect password!"
				fmt.Println("ID2", db_id)
				fmt.Println("PW2", db_password)
			} else {
				Authorized = true
			}

			var response struct {
				Username string `json:"username"`
				ErrorMsg string `json:"errormsg"`
			}

			if Authorized {
				response.ErrorMsg = ""
				response.Username = user.Username
			}

			if !Authorized {
				response.ErrorMsg = msgToClient
			}

			// Convert the response struct to JSON
			jsonResponse, err := json.Marshal(response)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// Set the content type to application/json and write the response
			w.Header().Set("Content-Type", "application/json")
			w.Write(jsonResponse)

		}
	})

	http.HandleFunc("/register", func(w http.ResponseWriter, r *http.Request) {
		var user struct {
			Email     string `json:"email"`
			Username  string `json:"username"`
			Password  string `json:"password"`
			FirstName string `json:"firstname"`
			LastName  string `json:"lastname"`
			Gender    string `json:"gender"`
			Age       string `json:"age"`
		}
		err := json.NewDecoder(r.Body).Decode(&user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		var Status = false
		// Insert user input into the database only if POST method is used. Otherwise, empty fields will be inserted into the database, everytime when the page is loaded.
		if r.Method == "POST" {

			Status = false
			var email_userName_Count int
			// Check if email or username already exists in database. Count the number of rows that match the email or username.
			// Add the count to variable email_userName_Count.
			err := db.QueryRow("SELECT COUNT(*) FROM people WHERE EMAIL = ? OR USERNAME = ?", user.Email, user.Username).Scan(&email_userName_Count)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			// If there are more than 0 rows that match the email or username, set registration_error to true and display error Status.
			if email_userName_Count > 0 && user.Email != "" && user.Username != "" && user.Password != "" {

				// Check if any fields are empty
			} else {
				Status = true
			}
			// If all fields are filled and email/username duplicate is not found then instert user input into database.
			if Status {
				statement, err := db.Prepare("INSERT INTO people(EMAIL, USERNAME, PASSWORD, FNAME, LNAME, GENDER, AGE) VALUES (?, ?, ?, ?, ?, ?, ?)")
				if err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				_, err = statement.Exec(user.Email, user.Username, user.Password, user.FirstName, user.LastName, user.Gender, user.Age)
				if err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
			}

			var response struct {
				Username string `json:"username"`
				ErrorMsg string `json:"errormsg"`
			}

			if Status {
				response.ErrorMsg = ""
				response.Username = user.Username
			}
			if !Status {
				response.ErrorMsg = "E-mail or Username already taken!"
			}

			// Convert the response struct to JSON
			jsonResponse, err := json.Marshal(response)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// Set the content type to application/json and write the response
			w.Header().Set("Content-Type", "application/json")
			w.Write(jsonResponse)

		}
	})

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
