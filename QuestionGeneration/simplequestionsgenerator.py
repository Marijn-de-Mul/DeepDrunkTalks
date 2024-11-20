import json
import random

# Define templates and topics
templates = [
    "What is your favorite {}?",
    "If you could have any {}, what would it be?",
    "What is the best {} you've ever {}?",
    "What is your favorite {} and why?",
    "What was the last {} you {}?",
    "What do you think about {}?",
    "How do you feel about {}?",
    "Can you describe a {} you {}?",
    "What inspires you most about {}?",
    "What advice would you give to someone about {}?",
    "Have you ever {}? What was it like?",
    "Do you prefer {} or {}? Why?",
    "What is your dream {}?",
    "If you could change anything about {}, what would it be?",
    "What is the most exciting {} you've ever {}?"
]

topics = [
    "memory",
    "superpower",
    "book",
    "movie",
    "song",
    "hobby",
    "adventure",
    "dream",
    "meal",
    "place you've visited",
    "goal you've achieved",
    "skill you've learned",
    "friendship",
    "family tradition",
    "challenge you've faced",
    "decision you've made",
    "role model",
    "holiday experience",
    "job",
    "pet",
    "technology",
    "game",
    "sport",
    "vacation",
    "subject in school",
    "invention",
    "activity",
    "project"
]

# Generate questions
questions = set()  # Use a set to ensure uniqueness
max_questions = 4000  # Limit to 10,000 unique questions

while len(questions) < max_questions:
    template = random.choice(templates)
    topic1 = random.choice(topics)
    topic2 = random.choice(topics)

    # Check the number of placeholders in the template
    placeholder_count = template.count("{}")
    
    if placeholder_count == 1:
        question = template.format(topic1)
    elif placeholder_count == 2:
        question = template.format(topic1, topic2)
    else:
        continue  # Skip templates with unexpected placeholder counts

    questions.add(question)


# Convert to a list for JSON output
questions_list = list(questions)

# Save to JSON file
with open("questions.json", "w") as file:
    json.dump(questions_list, file, indent=2)

print(f"Generated {len(questions_list)} questions and saved to 'questions.json'.")
