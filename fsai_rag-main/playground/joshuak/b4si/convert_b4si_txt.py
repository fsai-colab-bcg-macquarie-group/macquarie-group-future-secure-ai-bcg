import glob

import src_doc_preprocess.docx_to_txt as docx_to_txt

if __name__ == "__main__":

    docx_files = glob.glob("data/b4si/docx/*.docx")
    for docx_file in docx_files:
        docx_to_txt.flatten_docx_to_txt(docx_file)
