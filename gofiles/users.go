package gofiles

import (
	"fmt"
	"log"
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
