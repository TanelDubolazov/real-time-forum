package services

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"01.kood.tech/git/mmumm/real-time-forum.git/internal/models"
)

type PostService interface {
	Create(post *models.Post) error
	GetList() ([]models.Post, error)
	GetByID(postID string) (*models.Post, error)
}

type PostDatabaseService struct {
	Database *sql.DB
}

func NewPostService(db *sql.DB) PostService {
	return &PostDatabaseService{Database: db}
}

func (pds *PostDatabaseService) Create(post *models.Post) error {

	createdAt := time.Now()
	updatedAt := createdAt
	post.CreatedAt = createdAt
	post.UpdatedAt = updatedAt

	_, err := pds.Database.Exec(
		"INSERT INTO posts (id, title, content, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
		post.Id, post.Title, post.Content, post.UserId, createdAt, updatedAt,
	)
	if err != nil {
		if strings.Contains(err.Error(), "FOREIGN KEY constraint failed") {
			return fmt.Errorf("user id not found")
		}
		return fmt.Errorf("failed to insert post: %v", err)
	}
	return nil
}

func (pds *PostDatabaseService) GetList() ([]models.Post, error) {
	rows, err := pds.Database.Query("SELECT id, title, content, user_id, created_at, updated_at FROM posts")
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve posts: %v", err)
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		var post models.Post
		err := rows.Scan(&post.Id, &post.Title, &post.Content, &post.UserId, &post.CreatedAt, &post.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan post: %v", err)
		}
		posts = append(posts, post)
	}

	return posts, nil
}

func (pds *PostDatabaseService) GetByID(postID string) (*models.Post, error) {
	var post models.Post
	err := pds.Database.QueryRow("SELECT id, title, content, user_id, created_at, updated_at FROM posts WHERE id = ?", postID).
		Scan(&post.Id, &post.Title, &post.Content, &post.UserId, &post.CreatedAt, &post.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("post not found")
		}
		return nil, fmt.Errorf("failed to retrieve post: %v", err)
	}
	return &post, nil
}
