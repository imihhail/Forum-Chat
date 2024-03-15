package gofiles

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func Likes(w http.ResponseWriter, r *http.Request) {
	var user struct {
		LikedPostId int    `json:"likedPostId"`
		Likechoice  string `json:"likechoice"`
		UserID      string `json:"userID"`
	}

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var likeCount int
	var userLikeCount int

	// Variables for sql statements
	var table string
	var updateTable string
	var count string
	var deleteTable string
	var updateCount string

	// Change sql command depending if user likes or dislikes post or comment.
	if user.Likechoice == "like" {
		table = "POSTLIKES"
		updateTable = "POSTS"
		count = "LIKECOUNT"
		deleteTable = "POSTDISLIKES"
		updateCount = "DISLIKECOUNT"

	} else if user.Likechoice == "dislike" {
		table = "POSTDISLIKES"
		updateTable = "POSTS"
		count = "DISLIKECOUNT"
		deleteTable = "POSTLIKES"
		updateCount = "LIKECOUNT"

	} else if user.Likechoice == "commentLike" {
		table = "COMMENTLIKES"
		updateTable = "COMMENTSTABLE"
		count = "LIKECOUNT"
		deleteTable = "COMMENTDISLIKES"
		updateCount = "DISLIKECOUNT"

	} else if user.Likechoice == "commentDislike" {
		table = "COMMENTDISLIKES"
		updateTable = "COMMENTSTABLE"
		count = "DISLIKECOUNT"
		deleteTable = "COMMENTLIKES"
		updateCount = "LIKECOUNT"
	}

	// Count how many times user liked or disliked a post or comment.
	err = Db.QueryRow("select count(*) from "+table+" WHERE POSTID = ? and USERNAME = ?", user.LikedPostId, user.UserID).Scan(&userLikeCount)
	if err != nil {
		fmt.Println("Error selecting user like count.", err)
		return
	}

	// If usercountLikeCount is 0, then user has not liked or disliked a post or comment.
	if userLikeCount == 0 {
		recieveLike, err := Db.Prepare("INSERT INTO " + table + " (POSTID, USERNAME) VALUES (?,?)")
		if err != nil {
			fmt.Println("Error preparing insert like statement.", err)
			return
		}

		_, err = recieveLike.Exec(user.LikedPostId, user.UserID)
		if err != nil {
			fmt.Println("Error executing insert like statement.", err)
			return
		}

		// Count how many times a post or comment has been liked or disliked.
		err = Db.QueryRow("select count(*) from "+table+" WHERE POSTID = ?", user.LikedPostId).Scan(&likeCount)
		if err != nil {
			fmt.Println("Error selecting like count.", err)
			return
		}

		// Update post or comment with new like or dislike count.
		likeToPost, err := Db.Prepare("UPDATE " + updateTable + " SET " + count + " = ? WHERE ID = ?")
		if err != nil {
			fmt.Println("Error preparing update like statement.", err)
			return
		}

		_, err = likeToPost.Exec(likeCount, user.LikedPostId)
		if err != nil {
			fmt.Println("Error executing update like statement.", err)
			return
		}

		// If user has liked or disliked a post or comment, then delete the opposite.
		deleteLike, err := Db.Prepare("DELETE FROM " + deleteTable + " WHERE POSTID = ? and USERNAME = ?")
		if err != nil {
			fmt.Println("Error preparing delete like statement.", err)
			return
		}

		_, err = deleteLike.Exec(user.LikedPostId, user.UserID)
		if err != nil {
			fmt.Println("Error executing delete like statement.", err)
			return
		}

		// After deleting an opposite row, count how many times a post or comment has been liked or disliked.
		err = Db.QueryRow("select count(*) from "+deleteTable+" WHERE POSTID = ?", user.LikedPostId).Scan(&likeCount)
		if err != nil {
			fmt.Println("Error selecting like count after deleting a row.", err)
			return
		}

		// Update opposite post or comment with new like or dislike count.
		dlikeToPost, err := Db.Prepare("UPDATE " + updateTable + " SET " + updateCount + " = ? WHERE ID = ?")
		if err != nil {
			fmt.Println("Error preparing update like statement after deleting a row.", err)
			return
		}

		_, err = dlikeToPost.Exec(likeCount, user.LikedPostId)
		if err != nil {
			fmt.Println("Error executing update like statement after deleting a row.", err)
			return
		}
	}
	if table == "POSTLIKES" || table == "POSTDISLIKES" {
		UpDatePostLikes(w, user.LikedPostId)
	} else {
		UpDateCommentLikes(w, user.LikedPostId)
	}
}

func UpDatePostLikes(w http.ResponseWriter, id int) {
	var response struct {
		LikeCount    int `json:"likeCountAfterLike"`
		DislikeCount int `json:"disLikeCountAfterLike"`
	}

	err := Db.QueryRow("select count(*) from POSTLIKES WHERE POSTID = ?", id).Scan(&response.LikeCount)
	if err != nil {
		fmt.Println("Error selecting like count.", err)
		return
	}

	err = Db.QueryRow("select count(*) from POSTDISLIKES WHERE POSTID = ?", id).Scan(&response.DislikeCount)
	if err != nil {
		fmt.Println("Error selecting dislike count.", err)
		return
	}

	jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}

func UpDateCommentLikes(w http.ResponseWriter, id int) {
	var response struct {
		LikeCount    int `json:"likeCountAfterLike"`
		DislikeCount int `json:"disLikeCountAfterLike"`
	}

	err := Db.QueryRow("select count(*) from COMMENTLIKES WHERE POSTID = ?", id).Scan(&response.LikeCount)
	if err != nil {
		fmt.Println("Error selecting like count.", err)
		return
	}

	err = Db.QueryRow("select count(*) from COMMENTDISLIKES WHERE POSTID = ?", id).Scan(&response.DislikeCount)
	if err != nil {
		fmt.Println("Error selecting dislike count.", err)
		return
	}

	jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}
