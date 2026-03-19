# Program-Based LMS: Database Architecture

This project defines a scalable, modular database schema for a modern Learning Management System (LMS) focused on structured learning paths (Programs) and dynamic access control.

## 🏗️ Core Architecture

The system is designed with a **modular first** approach, using PostgreSQL as the primary database.

### 1. Identity & Custom Auth (RBAC)
Unlike traditional systems with hard-coded roles, this implementation uses a **Dynamic RBAC** (Role-Based Access Control):
- **Permissions**: Granular action codes (e.g., `program:create`, `lesson:publish`) that the application code checks.
- **Roles**: Custom-definable roles created by administrators (e.g., "Program Manager", "Reviewer").
- **Dynamic Mapping**: Permissions are mapped to roles, and roles are assigned to users, allowing for infinite flexibility without code changes.

### 2. LMS Content (Program & Course Roadmap)
The content structure is designed to support complex curricula:
- **Programs**: The highest-level container representing a career path or long-term track.
- **Courses**: Standalone learning units that can be part of many programs.
- **Roadmap**: A defined sequence of courses within a program, allowing for structured progression.
- **Syllabus versioning**: Support for different versions of the same course over time.

## 📂 Project Structure (SQL Schemas)

The database definition is split into focused SQL artifacts:

| File | Module | Description |
| :--- | :--- | :--- |
| [auth_flow_schema.sql](./auth_flow_schema.sql) | Identity | Users, Roles (Custom), Permissions, OAuth, 2FA, Sessions. |
| [lms_core_schema.sql](./lms_core_schema.sql) | Content | Programs, Courses, Roadmaps, Syllabuses, Lessons. |

## 🛠️ Design Standards

- **Primary Keys**: Used UUID v4 for all entity IDs to ensure global uniqueness and scalability.
- **Accuracy**: Used `TIMESTAMPTZ` for all date/time fields to prevent timezone-related bugs.
- **Integrity**: Strict Foreign Key constraints with `ON DELETE CASCADE` or `SET NULL` where appropriate.
- **Performance**: Pre-defined indexes on frequently queried columns (emails, codes, order indexes).
- **Proactivity**: Automated `updated_at` timestamps managed via PostgreSQL triggers.

## 🚀 Getting Started

1. **Prerequisites**: PostgreSQL 13+ installed.
2. **Setup**:
   - Run [auth_flow_schema.sql](file:///C:/Users/tienh/.gemini/antigravity/brain/bd143762-ceb0-4cfd-b14e-dce12f99ae98/auth_flow_schema.sql) first to establish the identity layer.
   - Run `lms_core_schema.sql` to establish the content layer.
3. **Usage**:
   - Seed the `permissions` table with your application's action codes.
   - Create your first Admin Role and assign it to a user.

---
*Created by Antigravity AI for a fresh, standalone LMS project.*
