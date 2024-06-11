package router

import (
	"net/http"

	"01.kood.tech/git/mmumm/real-time-forum.git/internal/handlers/comment"
	"01.kood.tech/git/mmumm/real-time-forum.git/internal/handlers/ping"
	"01.kood.tech/git/mmumm/real-time-forum.git/internal/handlers/post"
	"01.kood.tech/git/mmumm/real-time-forum.git/internal/handlers/user"
	"01.kood.tech/git/mmumm/real-time-forum.git/internal/middleware"
	"01.kood.tech/git/mmumm/real-time-forum.git/internal/services"
)

type Router struct {
	UserHandler    *user.Handler
	PostHandler    *post.Handler
	CommentHandler *comment.Handler
	Mux            *http.ServeMux
}

func NewRouter(userService services.UserService, postService services.PostService, commentService services.CommentService) *Router {
	userHandler := user.NewHandler(userService)
	postHandler := post.NewHandler(postService)
	commentHandler := comment.NewHandler(commentService)
	mux := http.NewServeMux()
	return &Router{UserHandler: userHandler, PostHandler: postHandler, CommentHandler: commentHandler, Mux: mux}
}

func (r *Router) InitializeRoutes() {
	r.initializeApiRoutes()
}

func (r *Router) initializeApiRoutes() {
	apiPrefix := "/api"
	r.Mux.Handle(apiPrefix+"/user", middleware.SendApiResponse(http.HandlerFunc(r.UserHandler.Create)))
	r.Mux.Handle(apiPrefix+"/post", middleware.SendApiResponse(http.HandlerFunc(r.PostHandler.Create)))
	r.Mux.Handle(apiPrefix+"/comment", middleware.SendApiResponse(http.HandlerFunc(r.CommentHandler.Create)))
	r.Mux.Handle(apiPrefix+"/ping", middleware.SendApiResponse(http.HandlerFunc(ping.PingHandler)))
	r.Mux.Handle(apiPrefix+"/login", middleware.SendApiResponse(http.HandlerFunc(r.UserHandler.Login)))
}
