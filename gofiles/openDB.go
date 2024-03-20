package gofiles

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

var Db *sql.DB

func init() {
	Db, _ = sql.Open("sqlite3", "./forumDatabase.db")

	usersTable, err := Db.Prepare("CREATE TABLE if not exists PEOPLE(ID integer primary key, EMAIL text, USERNAME text, PASSWORD text, FNAME text, LNAME text, GENDER text, AGE text)")
	if err != nil {
		log.Fatal(err)
	}
	usersTable.Exec()

	postsTable, err := Db.Prepare("CREATE TABLE if not exists POSTS(ID integer primary key, CATEGORIE text, CATEGORIE2 text, CATEGORIE3 text, CATEGORIE4 text, POST text, USERNAME text, LIKECOUNT integer default 0, DISLIKECOUNT integer default 0, COMMENTCOUNT integer default 0)")
	if err != nil {
		log.Fatal(err)
	}
	postsTable.Exec()

	commentsTable, err := Db.Prepare("CREATE TABLE if not exists COMMENTSTABLE(ID integer primary key, POSTID text, COMMENT text, USERNAME text, LIKECOUNT integer default 0, DISLIKECOUNT integer default 0)")
	if err != nil {
		log.Fatal(err)
	}
	commentsTable.Exec()

	postLikesTable, err := Db.Prepare("CREATE TABLE if not exists POSTLIKES(ID integer primary key, POSTID integer, USERNAME text default '')")
	if err != nil {
		log.Fatal(err)
	}
	postLikesTable.Exec()

	postDisLikesTable, err := Db.Prepare("CREATE TABLE if not exists POSTDISLIKES(ID integer primary key, POSTID integer, USERNAME text)")
	if err != nil {
		log.Fatal(err)
	}
	postDisLikesTable.Exec()

	commLikesTable, err := Db.Prepare("CREATE TABLE if not exists COMMENTLIKES(ID integer primary key, POSTID integer, USERNAME text)")
	if err != nil {
		log.Fatal(err)
	}
	commLikesTable.Exec()

	commentDisLikesTable, err := Db.Prepare("CREATE TABLE if not exists COMMENTDISLIKES (ID integer primary key, POSTID integer, USERNAME text)")
	if err != nil {
		log.Fatal(err)
	}
	commentDisLikesTable.Exec()

	privateMsgTable, err := Db.Prepare("CREATE TABLE if not exists PRIVATEMESSAGES (ID integer primary key, MSGSENDER text, MSGRECIEVER text, TEXTMSG text)")
	if err != nil {
		log.Fatal(err)
	}
	privateMsgTable.Exec()
}
