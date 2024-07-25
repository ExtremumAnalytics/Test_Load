import os
import re
import PyPDF2
import docx
import pandas as pd
from PIL import Image
from mutagen.mp3 import MP3


def check_file(file):
    try:

        # Get the file extension
        _, file_extension = os.path.splitext(file.filename)

        if file_extension.lower() == '.pdf':
            return read_pdf_file(file)
        elif file_extension.lower() in ['.doc', '.docx']:
            return read_docx_file(file)
        elif file_extension.lower() in ['.jpeg', '.jpg', '.png']:
            return read_image_file(file)
        elif file_extension.lower() == '.mp3':
            return read_mp3_file(file)
        elif file_extension.lower() in ['.xls', '.xlsx']:
            return read_excel_file(file)
        elif file_extension.lower() in ['.csv']:
            return read_csv_file(file)
        else:
            print(f"Unsupported file format: '{file_extension}'")
            return False

    except ValueError as e:
        return str(e)
    except Exception as e:
        return f"An unexpected error occurred while processing the file '{file}': {str(e)}"


def read_pdf_file(file):
    try:
        file.stream.seek(0)
        reader = PyPDF2.PdfReader(file)
        file.stream.seek(0)  # Reset the pointer after reading
        if reader.is_encrypted:
            reader.decrypt('')  # Decrypt the file if it is encrypted

        text = ""
        num_pages = len(reader.pages)
        # Sample the first few pages
        pages_to_check = min(2, num_pages)
        for page_num in range(pages_to_check):
            page = reader.pages[page_num]
            text += page.extract_text() + "\n"
        if text and text.strip():
            file.stream.seek(0)  # Reset the pointer after reading
            return False
        return True

    except Exception as e:
        raise e


def read_docx_file(file):
    try:
        file.stream.seek(0)
        doc = docx.Document(file)
        file.stream.seek(0)  # Reset the pointer after reading
        paragraphs = doc.paragraphs
        num_paragraphs = len(paragraphs)

        # Sample the first few paragraphs
        paragraphs_to_check = min(2, num_paragraphs)
        for paragraph in paragraphs[:paragraphs_to_check]:
            if paragraph.text.strip():
                file.stream.seek(0)  # Reset the pointer after reading
                return False
        file.stream.seek(0)  # Reset the pointer after reading
        return True

    except Exception as e:
        raise e


def read_image_file(file):
    try:
        file.stream.seek(0)
        image = Image.open(file)
        file.stream.seek(0)  # Reset the pointer after reading
        if image.size != (0, 0):
            file.stream.seek(0)  # Reset the pointer after reading
            return False
        return True
    except Exception as e:
        return f"Error reading image file: {str(e)}"


def read_mp3_file(file):
    try:
        file.stream.seek(0)
        audio = MP3(file)
        file.stream.seek(0)  # Reset the pointer after reading
        if audio.info.length > 0:
            file.stream.seek(0)  # Reset the pointer after reading
            return False
        return True
    except Exception as e:
        return f"Error reading MP3 file: {str(e)}"


def read_excel_file(file):
    try:
        file.stream.seek(0)
        data = pd.read_excel(file, nrows=5)
        file.stream.seek(0)  # Reset the pointer after reading
        if not data.empty:
            file.stream.seek(0)  # Reset the pointer after reading
            return False
        return True
    except Exception as e:
        return f"Error reading Excel file: {str(e)}"


def read_csv_file(file):
    try:
        file.stream.seek(0)
        df = pd.read_csv(file, nrows=5)
        file.stream.seek(0)  # Reset the pointer after reading
        if not df.empty:
            file.stream.seek(0)  # Reset the pointer after reading
            return False
        return True
    except pd.errors.EmptyDataError:
        return True  # If the CSV is empty
    except Exception as e:
        return f"Error reading CSV file: {str(e)}"


def check_error(text):
    policy_match = re.search(r"The response was filtered due to the prompt triggering Azure OpenAI's content management policy", text)
    value_match = re.search(r"float division by zero", text)
    corrupt_match = re.search(r"EOF marker not found", text)
    if policy_match:
        return 'policyError'
    elif value_match:
        return 'valueError'
    elif corrupt_match:
        return 'corruptFile'
    return None
