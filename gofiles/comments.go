package gofiles

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

func PostComment(w http.ResponseWriter, r *http.Request) {
	var user struct {
		PostID      int    `json:"postid"`
		UserComment string `json:"usercomment"`
		Username    string `json:"username"`
	}

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	commentToDatabase, err := Db.Prepare("INSERT INTO COMMENTSTABLE(POSTID, COMMENT, USERNAME) VALUES (?,?,?)")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = commentToDatabase.Exec(user.PostID, user.UserComment, user.Username)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func ShowComments(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body",
			http.StatusInternalServerError)
	}
	postID := string(body)

	sql_comments, err := Db.Query("Select COMMENT, USERNAME, ID from COMMENTSTABLE where POSTID = ?", postID)
	if err != nil {
		fmt.Println("Error getting comments from database:", err)
	}
	defer sql_comments.Close()

	type Data struct {
		AllComments   []string
		AllUsers      []string
		AllCommentIDs []int
	}

	var AllCommentData []Data

	for sql_comments.Next() {
		var commentCreator string
		var comment string
		var postID int

		if err := sql_comments.Scan(&commentCreator, &comment, &postID); err != nil {
			log.Fatal(err)
		}
		AllCommentData = append(AllCommentData, Data{AllUsers: []string{commentCreator},AllComments: []string{comment}, AllCommentIDs: []int{postID}})
	}

	jsonResponse, err := json.Marshal(AllCommentData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}
