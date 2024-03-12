package gofiles

import (
	"encoding/json"
	"net/http"
)

func HandlePosts(w http.ResponseWriter, r *http.Request) {
	var user struct {
		Categories []string `json:"categories"`
		PostText   string   `json:"text"`
		Username   string   `json:"username"`
	}

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	var cat1 = user.Categories[0]
	var cat2 = user.Categories[1]
	var cat3 = user.Categories[2]
	var cat4 = user.Categories[3]

	postToDatabase, err := Db.Prepare("INSERT INTO POSTS(CATEGORIE, CATEGORIE2, CATEGORIE3, CATEGORIE4, POST, USERNAME) VALUES (?,?,?,?,?,?)")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = postToDatabase.Exec(cat1, cat2, cat3, cat4, user.PostText, user.Username)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
