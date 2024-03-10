package gofiles

import (
	"context"
	"encoding/json"
	"net/http"
)

var Authorized = false
var Logged_user string
var db_id string

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	var user struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if r.Method == "POST" {
		// Get password and username from database if users inserted email exists in database.
		pw_userID_check := Db.QueryRowContext(context.Background(), "SELECT ID, PASSWORD, USERNAME FROM people WHERE EMAIL = ? OR USERNAME = ?", user.Username, user.Username)

		var db_password string
		email_found := true
		var msgToClient = ""

		// If err != nil, then email is not found from database.
		if err := pw_userID_check.Scan(&db_id, &db_password, &Logged_user); err != nil {
			Authorized = false
			email_found = false
			msgToClient = "E-mail or username is not registered!"

		} else if user.Password != db_password && email_found {
			Authorized = false
			msgToClient = "Incorrect password!"

		} else {
			Authorized = true
		}

		var response struct {
			Username string `json:"username"`
			ErrorMsg string `json:"errormsg"`
		}

		if Authorized {
			CreateCookie(w)
			response.ErrorMsg = ""
			response.Username = Logged_user
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
