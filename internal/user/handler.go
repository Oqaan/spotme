package user

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/Oqaan/spotme/internal/middleware"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	user, err := h.svc.GetUser(r.Context(), userID)
	if err != nil {
		respondError(w, http.StatusNotFound, "user not found")
		return
	}
	respondJSON(w, http.StatusOK, user)
}

func (h *Handler) UpdateName(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	var req UpdateNameRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if len(req.Name) == 0 || len(req.Name) > 50 {
		respondError(w, http.StatusBadRequest, "name must be between 1 and 50 characters")
		return
	}
	if err := h.svc.UpdateName(r.Context(), userID, req.Name); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update name")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"message": "name updated"})
}

func (h *Handler) UpdatePassword(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	var req UpdatePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if len(req.NewPassword) < 6 || len(req.NewPassword) > 72 {
		respondError(w, http.StatusBadRequest, "password must be between 6 and 72 characters")
		return
	}
	err := h.svc.UpdatePassword(r.Context(), userID, req)
	if errors.Is(err, ErrWrongPassword) {
		respondError(w, http.StatusUnauthorized, err.Error())
		return
	}
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update password")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"message": "password updated"})
}

func (h *Handler) DeleteAccount(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	if err := h.svc.DeleteAccount(r.Context(), userID); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete account")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func respondJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, msg string) {
	respondJSON(w, status, map[string]string{"error": msg})
}
