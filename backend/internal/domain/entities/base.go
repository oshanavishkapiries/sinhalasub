package entities

import "time"

// BaseEntity represents common fields for all entities
type BaseEntity struct {
	ID        string     `json:"id"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}

// IsDeleted checks if the entity is soft deleted
func (be *BaseEntity) IsDeleted() bool {
	return be.DeletedAt != nil
}

// SoftDelete performs a soft delete on the entity
func (be *BaseEntity) SoftDelete() {
	now := time.Now()
	be.DeletedAt = &now
}

// Restore restores a soft deleted entity
func (be *BaseEntity) Restore() {
	be.DeletedAt = nil
}
