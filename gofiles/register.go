package gofiles

import (
	"encoding/json"
	"net/http"
)

func HandleRegister(w http.ResponseWriter, r *http.Request) {
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
		err := Db.QueryRow("SELECT COUNT(*) FROM people WHERE EMAIL = ? OR USERNAME = ?", user.Email, user.Username).Scan(&email_userName_Count)
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
			statement, err := Db.Prepare("INSERT INTO people(EMAIL, USERNAME, PASSWORD, FNAME, LNAME, GENDER, AGE) VALUES (?, ?, ?, ?, ?, ?, ?)")
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

			var registeredUsers []AllUsers

			for _, conn := range clients {
				SendUsers(conn, registeredUsers)
			}
		}
		if !Status {
			response.ErrorMsg = "E-mail or Username already taken!"
		}

		jsonResponse, err := json.Marshal(response)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonResponse)
	}
}
