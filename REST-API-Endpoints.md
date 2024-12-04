POST /api/users/register                -- Register a new user
POST /api/users/login                   -- Log in an existing user

POST /api/conversations                  -- Start a new conversation
PUT /api/conversations/{id}/stop         -- Stop a specific conversation (mark as stopped, not delete)
DELETE /api/conversations/{id}           -- Delete a specific conversation permanently
GET /api/conversations                   -- Retrieve all conversations
GET /api/conversations/{id}              -- Retrieve a specific conversation by ID

POST /api/conversations/{id}/file        -- Upload a file (audio or other) to a conversation
GET /api/conversations/{id}/file         -- Retrieve the file (audio or other) for a conversation

GET /api/users/{id}/settings             -- Retrieve the settings for a specific user
PUT /api/users/{id}/settings             -- Update the settings for a specific user
