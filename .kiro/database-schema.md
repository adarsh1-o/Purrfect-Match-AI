# Database Schema & ERD

## ER Diagram

```mermaid
erDiagram
    USERS ||--o| QUESTIONNAIRES : "submits"
    CATS ||--o| PERSONALITY_PROFILES : "has"
    USERS ||--o{ ADOPTION_REQUESTS : "files"
    CATS ||--o{ BEHAVIOUR_LOGS : "logs"
```

## Table Specifications
- **`users`**: Primary identifier, email index.
- **`cats`**: Standard name, age, breed, gender parameters.
- **`personality_profiles`**: Linked 1:1 to cat record, holding playfulness, curiosity, energy indexes.
