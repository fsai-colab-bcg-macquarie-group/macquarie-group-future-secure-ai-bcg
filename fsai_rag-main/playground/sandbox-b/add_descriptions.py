import os

from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage, SystemMessage


def get_llm_description(table_content: str) -> str:
    """
    Generate a description of the table using LLM based on its content
    """
    llm = ChatOpenAI(
        model="gpt-4", temperature=0, openai_api_key=os.getenv("OPENAI_API_KEY")
    )

    system_prompt = """You are a data analyst helping to describe business benchmark data tables.
    Generate descriptions in a similar style to this example:
    "The following table aggregates the latest year of (1) total community contribution, (2) contribution per employee and (3) the contribution as a percentage of pre-tax profit for the year 2023."

    Your description should:
    1. Begin with "The following table..."
    2. List key metrics using numbered points (1), (2), etc.
    3. Identify unique column metrics (ignoring year-by-year repetition)
    4. Mention that metrics are shown for 2023
    5. Be clear, very concise, and professional
    6. Focus on the business metrics being presented
    7. Don't use any unnessary adjectives language report as is.

    Important: The table will show the same metrics repeated for different years - only list each metric once in your description, but indicate the time period covered."""

    human_prompt = f"""Based on this business benchmark table content:
    {table_content[:1000]}

    Generate a description in the style of the example, explaining what unique metrics this table shows (without repeating year-specific columns) and specify the overall time period covered."""

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=human_prompt),
    ]

    response = llm(messages)
    return response.content


def add_description_to_file(file_path: str, description: str):
    """
    Add a description at the start of an existing text file
    """
    try:
        # Read existing content
        with open(file_path, "r") as f:
            existing_content = f.read()

        # Write description and existing content
        with open(file_path, "w") as f:
            f.write(description + "\n\n" + existing_content)

        print(f"Successfully added description to {file_path}")

    except Exception as e:
        print(f"Error adding description to {file_path}: {str(e)}")


if __name__ == "__main__":
    txt_dir = "data/b4si/xlsx/TXT"

    # Process each text file in the directory
    for filename in os.listdir(txt_dir):
        if filename.endswith(".txt"):
            file_path = os.path.join(txt_dir, filename)

            # Read the content of the text file
            with open(file_path, "r") as f:
                content = f.read()

            # Generate description based on content
            try:
                description = get_llm_description(content)
                add_description_to_file(file_path, description)
            except Exception as e:
                print(f"Error processing {filename}: {str(e)}")
