import random
from datetime import datetime

# Define the topics and their related categories
topics = {
    "Physics": 1,
    "Biology": 1,
    "Chemistry": 1,
    "Astronomy": 1,
    "Genetics": 1,
    "Artificial Intelligence": 2,
    "Cybersecurity": 2,
    "Software Development": 2,
    "Blockchain": 2,
    "Robotics": 2,
    "World Wars": 3,
    "Ancient Civilizations": 3,
    "Industrial Revolution": 3,
    "Historical Leaders": 3,
    "History of Science": 3,
    "Continents": 4,
    "Oceans": 4,
    "Natural Disasters": 4,
    "World Capitals": 4,
    "Biomes and Ecosystems": 4,
    "Renaissance Art": 5,
    "Modern Art": 5,
    "Impressionism": 5,
    "Abstract Art": 5,
    "Sculptures": 5,
    "Shakespeare": 6,
    "Poetry": 6,
    "Modern Novels": 6,
    "Classic Literature": 6,
    "Literary Genres": 6,
    "Football": 7,
    "Olympics": 7,
    "Basketball": 7,
    "Tennis": 7,
    "Extreme Sports": 7,
    "Movies": 8,
    "Music Genres": 8,
    "Television Series": 8,
    "Video Games": 8,
    "Celebrities": 8,
    "Nutrition": 9,
    "Mental Health": 9,
    "Exercise Science": 9,
    "Medical Innovations": 9,
    "Public Health": 9,
    "Entrepreneurship": 10,
    "Economics": 10,
    "Marketing Strategies": 10,
    "Investment Basics": 10,
    "Corporate Ethics": 10
}

# Function to generate questions for a topic
def generate_questions_for_topic(topic, count):
    prompts = [
        f"What do you think about {topic}?",
        f"How has {topic} influenced our lives?",
        f"What is the most interesting aspect of {topic} to you?",
        f"If you could learn one new thing about {topic}, what would it be?",
        f"How do you think {topic} will change in the future?",
        f"What challenges exist in understanding or improving {topic}?",
        f"Can you share a personal experience related to {topic}?",
        f"How can we make {topic} more accessible or understandable?",
        f"What role does {topic} play in the world today?",
        f"Who are the key figures or milestones in {topic}?"
    ]
    return random.sample(prompts, count)

# Generate 500 questions and produce an INSERT query
def generate_insert_query():
    questions = []
    question_id = 1
    questions_per_topic = 10  # 500 questions across 50 topics
    topic_id_mapping = {i+1: topic for i, topic in enumerate(topics.keys())}  # Map to TopicId
    current_timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # Current timestamp

    for topic, category_id in topics.items():
        topic_id = list(topic_id_mapping.keys())[list(topic_id_mapping.values()).index(topic)]  # Get TopicId
        topic_questions = generate_questions_for_topic(topic, questions_per_topic)
        for question in topic_questions:
            # Escape single quotes and handle them in SQL-safe format
            question_safe = question.replace("'", "''")  # Escape single quotes for SQL
            questions.append(
                f"({question_id}, {topic_id}, '{question_safe}', '{current_timestamp}', '{current_timestamp}')"
            )
            question_id += 1

    # Construct the SQL INSERT query for questions
    insert_query = (
        "INSERT INTO \"Questions\" (\"QuestionId\", \"TopicId\", \"QuestionText\", \"CreatedAt\", \"UpdatedAt\")\n"
        "VALUES\n"
        + ',\n'.join(questions) + ";"
    )
    
    return insert_query

# Generate the SQL query
sql_query = generate_insert_query()

# Save to a file
output_file = "insert_questions.sql"
with open(output_file, "w") as file:
    file.write(sql_query)

print(f"SQL INSERT query for 500 questions has been saved to {output_file}.")
