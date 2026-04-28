package user

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrWrongPassword = errors.New("current password is incorrect")
	ErrNotFound      = errors.New("user not found")
)

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

func (s *Service) GetUser(ctx context.Context, userID string) (*UserResponse, error) {
	var u UserResponse
	err := s.db.QueryRow(ctx,
		`SELECT id, email, name FROM users WHERE id = $1`, userID,
	).Scan(&u.ID, &u.Email, &u.Name)
	if err != nil {
		return nil, ErrNotFound
	}
	return &u, nil
}

func (s *Service) UpdateName(ctx context.Context, userID, name string) error {
	tag, err := s.db.Exec(ctx,
		`UPDATE users SET name = $1 WHERE id = $2`, name, userID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Service) UpdatePassword(ctx context.Context, userID string, req UpdatePasswordRequest) error {
	var hash string
	err := s.db.QueryRow(ctx,
		`SELECT password_hash FROM users WHERE id = $1`, userID,
	).Scan(&hash)
	if err != nil {
		return ErrNotFound
	}
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.CurrentPassword)); err != nil {
		return ErrWrongPassword
	}
	newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	_, err = s.db.Exec(ctx,
		`UPDATE users SET password_hash = $1 WHERE id = $2`, string(newHash), userID)
	return err
}

func (s *Service) DeleteAccount(ctx context.Context, userID string) error {
	tag, err := s.db.Exec(ctx,
		`DELETE FROM users WHERE id = $1`, userID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
