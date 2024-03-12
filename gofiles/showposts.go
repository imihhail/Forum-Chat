package gofiles

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

func ShowPosts(w http.ResponseWriter, r *http.Request) {
	sql_posts, err := Db.Query("SELECT USERNAME, POST, ID, LIKECOUNT, DISLIKECOUNT FROM POSTS")
	if err != nil {
		fmt.Println("Error filtering posts from database:", err)
	}
	defer sql_posts.Close()

	type Data struct {
		AllPosts     []string
		AllUsers     []string
		AllPostIDs   []int
		LikeCount    []int
		DisLikeCount []int
	}

	var AllData []Data

	for sql_posts.Next() {
		var postCreator string
		var post string
		var postID int
		var likeCount int
		var disLikeCount int

		if err := sql_posts.Scan(&postCreator, &post, &postID, &likeCount, &disLikeCount); err != nil {
			log.Fatal(err)
		}
		AllData = append(AllData, Data{AllUsers: []string{postCreator}, AllPosts: []string{post}, AllPostIDs: []int{postID}, LikeCount: []int{likeCount}, DisLikeCount: []int{disLikeCount}})
	}

	jsonResponse, err := json.Marshal(AllData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}
