from llama_index.llms.openai import OpenAI


def get_contextual_appendum(document: str, chunk: str) -> str:
    assert isinstance(document, str) and isinstance(chunk, str)
    assert len(document) > 0 and len(chunk) > 0

    prompt = "\n<document> \n{WHOLE_DOCUMENT} \n</document> \nHere is the chunk we want to situate within the whole document \n<chunk> \n{CHUNK_CONTENT} \n</chunk> \nPlease give a short succinct context to situate this chunk within the overall document for the purposes of improving search retrieval of the chunk. Answer only with the succinct context and nothing else. \n"

    prompt = prompt.format(WHOLE_DOCUMENT=document, CHUNK_CONTENT=chunk)
    llm = OpenAI(model="gpt-4o")
    result = llm.complete(prompt)
    contextual_appendum = result.text

    return contextual_appendum


if __name__ == "__main__":

    document_path = "data/b4si/docx/TXT/B4SI BI Guidance Manual.txt"
    with open(document_path, "r") as file:
        document = file.read()

    chunk = document[500:600]

    contextual_appendum = get_contextual_appendum(document, chunk)
    print(contextual_appendum)
