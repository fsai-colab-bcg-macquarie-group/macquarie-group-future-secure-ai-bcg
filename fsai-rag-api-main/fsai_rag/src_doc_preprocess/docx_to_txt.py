import os

import pypandoc
from docx import Document


def extract_header_table_values(docx_filepath: str) -> str:
    """
    Extracts only the values from the standard header table cells in a DOCX file,
    with each value on a new line.

    Args:
        docx_filepath (str): The file path of the DOCX file.

    Returns:
        str: The combined values from the header table cells as a single string, with each value on a new line,
             or "" if no values are found.
    """
    values = []

    try:
        document = Document(docx_filepath)

        # Standard header (for values)
        for section in document.sections:
            if section.header:
                for table in section.header.tables:
                    for row in table.rows:
                        for cell in row.cells:
                            cell_text = cell.text.strip()
                            if cell_text:
                                values.append(cell_text)

        # Combine all values into a single string with each value on a new line
        values_text = "\n".join(values)
        return values_text.strip() or ""

    except Exception as e:
        print("An error occurred during header extraction:", e)
        return ""


def flatten_docx_to_txt(docx_filepath: str, header_extraction: bool = False) -> str:
    """
    Converts a DOCX file to a plain text file, including the header content,
    and saves it in a 'TXT' folder within the same directory as the DOCX file.

    Args:
        docx_filepath (str): The file path of the DOCX file to be converted.

    Raises:
        AssertionError: If the DOCX file does not exist at the given path.
    """
    # Ensure the DOCX file exists
    assert os.path.exists(docx_filepath), f"File not found: {docx_filepath}"

    # Get the absolute path of the DOCX file
    docx_filepath = os.path.abspath(docx_filepath)

    # Extract the filename without extension and directory
    docx_filename_without_extension_and_directory = os.path.splitext(
        os.path.basename(docx_filepath)
    )[0]

    # Define the folder path for the TXT file
    txt_file_folder = os.path.join(os.path.dirname(docx_filepath), "TXT")

    # Create the TXT folder if it does not exist
    if not os.path.exists(txt_file_folder):
        os.makedirs(txt_file_folder)

    # Define the full path for the output TXT file
    txt_file_path = os.path.join(
        txt_file_folder, docx_filename_without_extension_and_directory + ".txt"
    )

    # Convert the DOCX file to a plain text file using pypandoc
    _ = pypandoc.convert_file(
        docx_filepath, to="plain", encoding="utf-8", outputfile=txt_file_path
    )  # Silences the printout

    if header_extraction:
        header_content = extract_header_table_values(docx_filepath)

        # Prepend the header content to the converted text file
        if header_content:
            with open(txt_file_path, "r+", encoding="utf-8") as txt_file:
                original_content = txt_file.read()
                txt_file.seek(0)
                txt_file.write("Header:\n" + header_content + "\n\n" + original_content)

    return txt_file_path
