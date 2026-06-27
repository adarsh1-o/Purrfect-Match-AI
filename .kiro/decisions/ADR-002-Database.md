# ADR-002: SQLite Fallback
- **Status**: Approved
- **Context**: Judges need out-of-the-box local runs.
- **Decision**: Connect to SQLite file if no Postgres URL env variable is detected.
