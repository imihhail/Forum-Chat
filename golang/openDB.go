package endPoints

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

func init() {
	// Initialize the database connection
	db, _ = sql.Open("sqlite3", "./forumDatabase.db")

	// Create sql table if it does not exist
	usersTable, err := db.Prepare("CREATE TABLE if not exists PEOPLE(ID integer primary key, EMAIL text, USERNAME text, PASSWORD text, FNAME text, LNAME text, GENDER text, AGE text)")
	if err != nil {
		log.Fatal(err)
	}
	usersTable.Exec()

	postsTable, err := db.Prepare("CREATE TABLE if not exists POSTS(ID integer primary key, CATEGORIE text, CATEGORIE2 text, CATEGORIE3 text, CATEGORIE4 text, POST text varchar '10', USERID integer, LIKECOUNT integer default 0, DISLIKECOUNT integer default 0, COMMENTCOUNT integer default 0, IMG blob)")
	if err != nil {
		log.Fatal(err)
	}
	postsTable.Exec()

	commentsTable, err := db.Prepare("CREATE TABLE if not exists COMMENTSTABLE(ID integer primary key, POSTID text, COMMENT text, USERID integer, LIKECOUNT integer default 0, DISLIKECOUNT integer default 0)")
	if err != nil {
		log.Fatal(err)
	}
	commentsTable.Exec()

	postLikesTable, err := db.Prepare("CREATE TABLE if not exists POSTLIKES(ID integer primary key, POSTID integer, USERID integer)")
	if err != nil {
		log.Fatal(err)
	}
	postLikesTable.Exec()

	postDisLikesTable, err := db.Prepare("CREATE TABLE if not exists POSTDISLIKES(ID integer primary key, POSTID integer, USERID integer)")
	if err != nil {
		log.Fatal(err)
	}
	postDisLikesTable.Exec()

	commLikesTable, err := db.Prepare("CREATE TABLE if not exists COMMENTLIKES(ID integer primary key, POSTID integer, USERID integer)")
	if err != nil {
		log.Fatal(err)
	}
	commLikesTable.Exec()

	commentDisLikesTable, err := db.Prepare("CREATE TABLE if not exists COMMENTDISLIKES (ID integer primary key, POSTID integer, USERID integer)")
	if err != nil {
		log.Fatal(err)
	}
	commentDisLikesTable.Exec()
}
