import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
import json

# Load GPT-J Model (6B) with GPU support
print("Loading model and tokenizer...")
model_name = "EleutherAI/gpt-j-6B"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=torch.float16).to("cuda")
print("Model loaded successfully!")

# Function to generate questions
def generate_questions(prompt, num_questions=10, max_length=50):
    """
    Generate questions using GPT-J.

    Args:
        prompt (str): The input prompt to guide the generation.
        num_questions (int): Number of questions to generate in one batch.
        max_length (int): Maximum length of each generated question.

    Returns:
        list: A list of generated questions.
    """
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
    outputs = model.generate(
        inputs.input_ids,
        max_length=max_length,
        num_return_sequences=num_questions,
        temperature=0.9,  # Creativity level
        top_p=0.95,  # Top-p sampling for diverse output
        do_sample=True,
    )
    questions = [tokenizer.decode(output, skip_special_tokens=True).strip() for output in outputs]
    return questions

# Main script to generate 10,000 unique questions
def main():
    prompt = "Generate unique and interesting questions for conversations:"
    unique_questions = set()  # Use a set to ensure uniqueness
    batch_size = 50  # Questions per batch
    total_questions = 10000  # Target number of unique questions
    max_attempts = total_questions * 2  # Max attempts to ensure uniqueness
    attempts = 0

    print(f"Starting generation of {total_questions} unique questions...")

    while len(unique_questions) < total_questions and attempts < max_attempts:
        try:
            # Generate a batch of questions
            questions = generate_questions(prompt, num_questions=batch_size)
            unique_questions.update(questions)  # Add to the unique set
            print(f"Generated {len(questions)} questions. Total unique: {len(unique_questions)}")
        except Exception as e:
            print(f"Error during generation: {e}")
        attempts += 1

    # Save questions to a JSON file
    questions_list = list(unique_questions)[:total_questions]  # Ensure only target amount is saved
    with open("questions_10000.json", "w") as f:
        json.dump(questions_list, f, indent=2)

    print(f"Generation complete! {len(questions_list)} unique questions saved to 'questions_10000.json'.")

# Run the main function
if __name__ == "__main__":
    main()
