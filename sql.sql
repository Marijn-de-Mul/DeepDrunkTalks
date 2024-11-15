-- Users table with VolumeLevel and RefreshFrequency columns, VARCHAR without length constraints, and no default TIMESTAMPTZs
CREATE TABLE "Users" (
    "UserId" SERIAL PRIMARY KEY,
    "Name" VARCHAR NOT NULL,
    "Email" VARCHAR NOT NULL,
    "Password" VARCHAR NOT NULL,
    "VolumeLevel" INT,
    "RefreshFrequency" INT,
    "CreatedAt" TIMESTAMPTZ NOT NULL,
    "UpdatedAt" TIMESTAMPTZ NOT NULL
);

-- Categories table for grouping topics
CREATE TABLE "Categories" (
    "CategoryId" SERIAL PRIMARY KEY,
    "CategoryName" VARCHAR NOT NULL,
    "CreatedAt" TIMESTAMPTZ NOT NULL,
    "UpdatedAt" TIMESTAMPTZ NOT NULL
);

-- Topics table, each topic associated with a category
CREATE TABLE "Topics" (
    "TopicId" SERIAL PRIMARY KEY,
    "CategoryId" INT REFERENCES "Categories"("CategoryId") ON DELETE CASCADE,
    "TopicName" VARCHAR NOT NULL,
    "CreatedAt" TIMESTAMPTZ NOT NULL,
    "UpdatedAt" TIMESTAMPTZ NOT NULL
);

-- Conversations table, with topic association, VARCHAR fields, and no default TIMESTAMPTZs
CREATE TABLE "Conversations" (
    "ConversationId" SERIAL PRIMARY KEY,
    "UserId" INT REFERENCES "Users"("UserId") ON DELETE CASCADE,
    "TopicId" INT REFERENCES "Topics"("TopicId") ON DELETE SET NULL,
    "StartTime" TIMESTAMPTZ NOT NULL,
    "EndTime" TIMESTAMPTZ NOT NULL,
    "AudioFilePath" VARCHAR,
    "OnTopicAnalysis" TEXT,
    "CreatedAt" TIMESTAMPTZ NOT NULL, 
    "UpdatedAt" TIMESTAMPTZ NOT NULL
);


INSERT INTO "Users" ("Name", "Email", "Password", "VolumeLevel", "RefreshFrequency", "CreatedAt", "UpdatedAt")
VALUES 
('Marijn', 'marijndemul@gmail.com', 'bQSdft8/AympJ5tjAAwK/g==:SihrkD9xips7hbCIqQeseoY2GdhfLEPoDh+IoYt5c6U=', 50, 10, '2024-11-13 21:53:00', '2024-11-13 21:53:00');

INSERT INTO "Categories" ("CategoryId","CategoryName", "CreatedAt", "UpdatedAt")
VALUES 
('1','General', '2024-11-13 21:53:00', '2024-11-13 21:53:00');

INSERT INTO "Topics" ("CategoryId", "TopicName", "CreatedAt", "UpdatedAt")
VALUES 
(1, 'General', '2024-11-13 21:53:00', '2024-11-13 21:53:00');
