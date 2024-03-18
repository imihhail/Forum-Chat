package gofiles

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

func ShowPosts(w http.ResponseWriter, r *http.Request) {
	var postCount int

	err := Db.QueryRow("select count(*) from POSTS").Scan(&postCount)
	if err != nil {
		fmt.Println("Error counting POSTS.", err)
		return
	}

	sql_posts, err := Db.Query("SELECT USERNAME, POST, ID, LIKECOUNT, DISLIKECOUNT, CATEGORIE, CATEGORIE2, CATEGORIE3, CATEGORIE4 FROM POSTS")
	if err != nil {
		fmt.Println("Error filtering posts from database:", err)
	}
	defer sql_posts.Close()

	var Result [][]string
	
	for i := 1; i <= postCount; i++ {
		postLikersQuery := "SELECT USERNAME FROM POSTLIKES WHERE POSTID = ?"
		rows, err := Db.Query(postLikersQuery, i)
		if err != nil {
			fmt.Println("Error filtering postlikers from database:", err)
			continue
		}
		defer rows.Close()

		var postUsernames []string
		for rows.Next() {
			var username string
			err := rows.Scan(&username)
			if err != nil {
				fmt.Println("Error scanning row:", err)
				continue
			}
			postUsernames = append(postUsernames, username)
		}
		Result = append(Result, postUsernames)
	}

	type Data struct {
		AllPosts      []string
		AllUsers      []string
		AllPostIDs    []int
		LikeCount     []int
		DisLikeCount  []int
		Cat1          []string
		Cat2          []string
		Cat3          []string
		Cat4          []string
		PostUsernames [][]string
	}

	var AllData []Data
	for sql_posts.Next() {
		var postCreator string
		var post string
		var postID int
		var likeCount int
		var disLikeCount int
		var cat1 string
		var cat2 string
		var cat3 string
		var cat4 string

		if err := sql_posts.Scan(&postCreator, &post, &postID, &likeCount, &disLikeCount, &cat1, &cat2, &cat3, &cat4); err != nil {
			log.Fatal(err)
		}
		AllData = append(AllData, Data{AllUsers: []string{postCreator}, AllPosts: []string{post}, AllPostIDs: []int{postID}, LikeCount: []int{likeCount}, DisLikeCount: []int{disLikeCount}, Cat1: []string{cat1}, Cat2: []string{cat2}, Cat3: []string{cat3}, Cat4: []string{cat4}, PostUsernames: Result})
	}

	jsonResponse, err := json.Marshal(AllData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}
