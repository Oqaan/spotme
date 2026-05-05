package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/Oqaan/spotme/config"
	"github.com/Oqaan/spotme/internal/auth"
	"github.com/Oqaan/spotme/internal/db"
	"github.com/Oqaan/spotme/internal/friends"
	"github.com/Oqaan/spotme/internal/middleware"
	"github.com/Oqaan/spotme/internal/progress"
	"github.com/Oqaan/spotme/internal/session"
	"github.com/Oqaan/spotme/internal/user"
	"github.com/Oqaan/spotme/internal/workout"
)

func main() {
	cfg := config.Load()
	pool := db.Connect(cfg.DatabaseURL)
	defer pool.Close()

	// Services
	authSvc := auth.NewService(pool, cfg.JWTSecret)
	workoutSvc := workout.NewService(pool)
	sessionSvc := session.NewService(pool)
	progressSvc := progress.NewService(pool)
	friendsSvc := friends.NewService(pool)
	userSvc := user.NewService(pool)

	// Handlers
	authH := auth.NewHandler(authSvc)
	workoutH := workout.NewHandler(workoutSvc)
	sessionH := session.NewHandler(sessionSvc)
	progressH := progress.NewHandler(progressSvc)
	friendsH := friends.NewHandler(friendsSvc)
	userH := user.NewHandler(userSvc)

	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(middleware.RateLimit)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://spotme-pearl.vercel.app", "http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	// Public routes
	r.Post("/api/auth/register", authH.Register)
	r.Post("/api/auth/login", authH.Login)
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(middleware.Authenticate(authSvc))

		// Templates
		r.Get("/api/templates", workoutH.GetTemplates)
		r.Post("/api/templates", workoutH.CreateTemplate)
		r.Get("/api/templates/{id}", workoutH.GetTemplate)
		r.Put("/api/templates/{id}", workoutH.UpdateTemplate)
		r.Delete("/api/templates/{id}", workoutH.DeleteTemplate)

		// Exercises
		r.Post("/api/templates/{id}/exercises", workoutH.AddExercise)
		r.Put("/api/templates/{id}/exercises/{exerciseId}", workoutH.UpdateExercise)
		r.Delete("/api/templates/{id}/exercises/{exerciseId}", workoutH.DeleteExercise)

		// Sessions
		r.Get("/api/sessions", sessionH.GetSessions)
		r.Post("/api/sessions", sessionH.CreateSession)
		r.Get("/api/sessions/{id}", sessionH.GetSession)
		r.Delete("/api/sessions/{id}", sessionH.DeleteSession)

		// Sets
		r.Post("/api/sessions/{id}/sets", sessionH.AddSet)
		r.Patch("/api/sessions/{id}/sets/{setId}", sessionH.UpdateSet)
		r.Delete("/api/sessions/{id}/sets/{setId}", sessionH.DeleteSet)

		// Progress
		r.Get("/api/progress", progressH.GetAllProgress)
		r.Get("/api/progress/{exerciseId}", progressH.GetExerciseProgress)

		// Friends
		r.Get("/api/friends", friendsH.GetFriends)
		r.Post("/api/friends/request", friendsH.SendRequest)
		r.Put("/api/friends/{id}/accept", friendsH.AcceptRequest)
		r.Delete("/api/friends/{id}", friendsH.DeleteFriend)
		r.Get("/api/feed", friendsH.GetFeed)

		// Account
		r.Get("/api/account", userH.GetUser)
		r.Put("/api/account/name", userH.UpdateName)
		r.Put("/api/account/password", userH.UpdatePassword)
		r.Delete("/api/account", userH.DeleteAccount)
	})

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("server listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, r))
}
