package auth

import (
	"encoding/json"
	"errors"
	"net/http"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if len(req.Email) == 0 || len(req.Email) > 254 {
		respondError(w, http.StatusBadRequest, "invalid email")
		return
	}
	if len(req.Password) < 6 || len(req.Password) > 32 {
		respondError(w, http.StatusBadRequest, "password must be between 6 and 32 characters")
		return
	}
	if len(req.Name) == 0 || len(req.Name) > 20 {
		respondError(w, http.StatusBadRequest, "name must be between 1 and 20 characters")
		return
	}
	res, err := h.svc.Register(r.Context(), req)
	if errors.Is(err, ErrUserExists) {
		respondError(w, http.StatusConflict, err.Error())
		return
	}
	if err != nil {
		respondError(w, http.StatusInternalServerError, "register failed")
		return
	}
	respondJSON(w, http.StatusCreated, res)
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if len(req.Email) == 0 || len(req.Email) > 254 {
		respondError(w, http.StatusBadRequest, "invalid email")
		return
	}
	if len(req.Password) < 6 || len(req.Password) > 32 {
		respondError(w, http.StatusBadRequest, "invalid password")
		return
	}
	res, err := h.svc.Login(r.Context(), req)
	if errors.Is(err, ErrInvalidCreds) {
		respondError(w, http.StatusUnauthorized, err.Error())
		return
	}
	if err != nil {
		respondError(w, http.StatusInternalServerError, "login failed")
		return
	}
	respondJSON(w, http.StatusOK, res)
}

func respondJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, msg string) {
	respondJSON(w, status, map[string]string{"error": msg})
}
