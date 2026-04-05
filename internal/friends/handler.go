package friends

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/itsYuuuka/spotme/internal/middleware"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) GetFriends(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	friends, err := h.svc.GetFriends(r.Context(), userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to fetch friends")
		return
	}
	respondJSON(w, http.StatusOK, friends)
}

func (h *Handler) SendRequest(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	var req FriendRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	err := h.svc.SendRequest(r.Context(), userID, req.FriendEmail)
	if errors.Is(err, ErrUserNotFound) {
		respondError(w, http.StatusNotFound, "user not found")
		return
	}
	if errors.Is(err, ErrAlreadyFriends) {
		respondError(w, http.StatusConflict, err.Error())
		return
	}
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to send request")
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (h *Handler) AcceptRequest(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	friendshipID := chi.URLParam(r, "id")
	err := h.svc.AcceptRequest(r.Context(), friendshipID, userID)
	if errors.Is(err, ErrNotFound) {
		respondError(w, http.StatusNotFound, "friend request not found")
		return
	}
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to accept request")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) GetFeed(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	feed, err := h.svc.GetFeed(r.Context(), userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to fetch feed")
		return
	}
	respondJSON(w, http.StatusOK, feed)
}

func respondJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, msg string) {
	respondJSON(w, status, map[string]string{"error": msg})
}
