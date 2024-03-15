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

	sql_comments, err := Db.Query("Select COMMENT, USERNAME, ID, LIKECOUNT, DISLIKECOUNT from COMMENTSTABLE where POSTID = ?", postID)
	if err != nil {
		fmt.Println("Error getting comments from database:", err)
	}
	defer sql_comments.Close()

	type Data struct {
		AllComments   []string
		AllUsers      []string
		AllCommentIDs []int
		LikeCount    []int
		DisLikeCount []int
	}

	var AllCommentData []Data

	for sql_comments.Next() {
		var commentCreator string
		var comment string
		var postID int
		var likeCount int
		var disLikeCount int

		if err := sql_comments.Scan(&commentCreator, &comment, &postID, &likeCount, &disLikeCount); err != nil {
			log.Fatal(err)
		}
		AllCommentData = append(AllCommentData, Data{AllUsers: []string{commentCreator},AllComments: []string{comment}, AllCommentIDs: []int{postID}, LikeCount: []int{likeCount}, DisLikeCount: []int{disLikeCount}})
	}

	jsonResponse, err := json.Marshal(AllCommentData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}
