package gofiles

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gofrs/uuid"
)

// Create a map to store session ID and user ID to display correct logged in user, dependng which session is currently active.
var sessions = make(map[string]string)
var SessionUSer *string

// If user logs in successfully, generate a session ID for the CreateCookie function.
func GenerateSessionID() string {
	if Authorized {
		sessionUUID, err := uuid.NewV4()
		if err != nil {
			fmt.Printf("Error generating session UUID: %v\n", err)
		}
		return sessionUUID.String()
	}
	// If user is not logged in or enters wrong credidentals, return empty string and cookie will not be created.
	return ""
}

// If user logs in successfully, UUID will be created into sessionKey and cookie will be created.
func CreateCookie(w http.ResponseWriter) {
	sessionKey := GenerateSessionID()
	expirationTime := time.Now().Add(30 * time.Minute)

	// Store session ID and user ID into sessions map.
	sessions[sessionKey] = Logged_user

	http.SetCookie(w, &http.Cookie{
		Name:    "session_token",
		Value:   sessionKey,
		Path:    "/",            // Cookie is valid for all paths
		Expires: expirationTime, // Cookie expires in 30mins and user will be logged out.
		//Secure:   true,
		//HttpOnly: true,
	})
}

// Check if session is exists. If not, user is not logged in
func CheckSession(w http.ResponseWriter, r *http.Request){
	Cookie, err := r.Cookie("session_token")

	if err != nil {	
		w.Write([]byte(""))
	} else {	
		username := sessions[Cookie.Value]
		w.Write([]byte(username))
	}
}

func Logout(w http.ResponseWriter, r *http.Request) {
	Cookie, err := r.Cookie("session_token")
	if err != nil {
		fmt.Println("No cookie found")
	}

	http.SetCookie(w, &http.Cookie{
		Name:   "session_token",
		Value:  "",
		MaxAge: -1,
		Path:   "/",
		//Secure:   true,
		//HttpOnly: true, // Protects against XSS attacks
	})

	delete(sessions, Cookie.Value)
	http.Redirect(w, r, "/home", http.StatusSeeOther)
}
