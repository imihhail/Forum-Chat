package gofiles

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

var AllUsers []string

func ShowUsers() []string {
	AllUsers = nil
	sql_users, err := Db.Query("SELECT USERNAME FROM PEOPLE")
	if err != nil {
		fmt.Println("Error selecting all users", err)
	}
	defer sql_users.Close()

	for sql_users.Next() {
		var users string

		if err := sql_users.Scan(&users); err != nil {
			log.Fatal(err)
		}
		AllUsers = append(AllUsers, users)
	}
	return AllUsers
}

func SendChatHistory(w http.ResponseWriter, r *http.Request) {
	type ChatHistory struct {
		Sender string
		Text   string
		Time   string
	}

	var chatHistory struct {
		MsgSender        string `json:"msgsender"`
		MsgReciever      string `json:"msgreciever"`
		LoadMoreMessages string `json:"loadMessages"`
	}

	err := json.NewDecoder(r.Body).Decode(&chatHistory)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	sql_chat, err := Db.Query("SELECT MSGSENDER, TEXTMSG, TIME FROM PRIVATEMESSAGES WHERE (MSGSENDER = ? AND MSGRECIEVER = ?) OR (MSGSENDER = ? AND MSGRECIEVER = ?) ORDER BY ID DESC LIMIT 10 OFFSET "+chatHistory.LoadMoreMessages+"", chatHistory.MsgSender, chatHistory.MsgReciever, chatHistory.MsgReciever, chatHistory.MsgSender)

	if err != nil {
		fmt.Println("Error selecting all users", err)
	}
	defer sql_chat.Close()

	var SendPrivateMessages []ChatHistory

	for sql_chat.Next() {
		var sender string
		var chat string
		var time string

		if err := sql_chat.Scan(&sender, &chat, &time); err != nil {
			log.Fatal(err)
		}
		SendPrivateMessages = append(SendPrivateMessages, ChatHistory{Sender: sender, Text: chat, Time: time})
	}

	jsonResponse, err := json.Marshal(SendPrivateMessages)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}
