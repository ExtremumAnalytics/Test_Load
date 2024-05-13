import pickle
import re

with open('final_chunks.pkl', 'rb') as f:
    mynewlist = pickle.load(f)


def clean_text(text):
    # Remove extra characters using regular expressions
    cleaned_text = re.sub(r"[^a-zA-Z0-9\s]", "", text)
    # Replace consecutive whitespace characters with a single space
    cleaned_text = re.sub(r"\s+", " ", cleaned_text)
    return cleaned_text.strip()


class CharacterTextSplitter:
    def __init__(self, separator="\n", chunk_size=1000, chunk_overlap=200, length_function=len):
        self.separator = separator
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.length_function = length_function

    def split_text(self, text):
        chunks = []
        current_chunk = ""
        current_length = 0

        # If text is already a list, join it to form a single string
        if isinstance(text, list):
            text = "\n".join([str(item) for item in text])  # Extract text from each document

        # Clean the text
        text = clean_text(text)

        # Split the text based on the separator
        lines = text.split(self.separator)

        for line in lines:
            line_length = self.length_function(line)

            # If adding this line would exceed the chunk size, start a new chunk
            if current_length + line_length + len(self.separator) > self.chunk_size:
                chunks.append(current_chunk.strip())
                current_chunk = ""
                current_length = 0

            # Add the line to the current chunk
            current_chunk += line + self.separator
            current_length += line_length + len(self.separator)

        # Add the last chunk
        if current_chunk:
            chunks.append(current_chunk.strip())

        return chunks


def get_text_chunks(row_text):
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )

    chunks = text_splitter.split_text(row_text)
    print(f"No. of chunks: {len(chunks)}")
    return chunks


Final_List = get_text_chunks(mynewlist)