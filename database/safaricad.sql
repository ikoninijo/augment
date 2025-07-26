-- SafariCAD Database Schema
-- Created for SafariCAD application

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(20) DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Drawings table
CREATE TABLE IF NOT EXISTS drawings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    drawing_data TEXT, -- JSON data for CAD elements
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT 1,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- CAD Elements table
CREATE TABLE IF NOT EXISTS cad_elements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drawing_id INTEGER NOT NULL,
    element_type VARCHAR(50) NOT NULL, -- line, circle, rectangle, etc.
    element_data TEXT NOT NULL, -- JSON data for element properties
    layer_name VARCHAR(50) DEFAULT 'default',
    is_visible BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (drawing_id) REFERENCES drawings(id) ON DELETE CASCADE
);

-- Project collaborators table
CREATE TABLE IF NOT EXISTS project_collaborators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    permission_level VARCHAR(20) DEFAULT 'read', -- read, write, admin
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(project_id, user_id)
);

-- Drawing versions table for version control
CREATE TABLE IF NOT EXISTS drawing_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drawing_id INTEGER NOT NULL,
    version_number INTEGER NOT NULL,
    drawing_data TEXT,
    comment TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (drawing_id) REFERENCES drawings(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Insert sample data
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES
('admin', 'admin@safaricad.com', '$2b$10$example_hash', 'Admin', 'User', 'admin'),
('john_doe', 'john@example.com', '$2b$10$example_hash', 'John', 'Doe', 'user'),
('jane_smith', 'jane@example.com', '$2b$10$example_hash', 'Jane', 'Smith', 'user');

INSERT INTO projects (name, description, owner_id) VALUES
('Safari Lodge Design', 'Architectural design for a luxury safari lodge', 1),
('Wildlife Center Layout', 'Layout design for visitor center', 2),
('Camping Site Plan', 'Site planning for eco-friendly camping area', 1);

INSERT INTO drawings (project_id, name, description, drawing_data, created_by) VALUES
(1, 'Main Building Floor Plan', 'Ground floor layout of the main lodge building', '{"elements": []}', 1),
(1, 'Site Plan', 'Overall site layout and landscaping', '{"elements": []}', 1),
(2, 'Visitor Center Layout', 'Interior layout of the visitor center', '{"elements": []}', 2);

-- Create indexes for better performance
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_drawings_project ON drawings(project_id);
CREATE INDEX idx_cad_elements_drawing ON cad_elements(drawing_id);
CREATE INDEX idx_collaborators_project ON project_collaborators(project_id);
CREATE INDEX idx_collaborators_user ON project_collaborators(user_id);
CREATE INDEX idx_drawing_versions_drawing ON drawing_versions(drawing_id);
