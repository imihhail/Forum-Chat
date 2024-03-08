package endPoints

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
)

func handleRegister(w http.ResponseWriter, r *http.Request) {
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
}
