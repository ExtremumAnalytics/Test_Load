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

#
# Final_List = get_text_chunks(mynewlist)
#
#
# def is_serializable(data):
#     try:
#         json.dumps(data)
#         return True
#     except (TypeError, ValueError):
#         return False
#
#
# print(is_serializable(Final_List))

# def get_pdf_text(pdf_docs):
#     text = ""
#     for pdf in pdf_docs:
#         pdf_reader = PdfReader(pdf)
#         for page in pdf_reader.pages:
#             text += page.extract_text()
#     return text
#
#
# def get_text_chunks(row_text):
#     text_spliter = CharacterTextSplitter(
#         separator="\n",
#         chunk_size=1000,
#         chunk_overlap=200,
#         length_function=len
#     )
#
#     chunks = text_spliter.split_text(row_text)
#     print(f"No. of chunks: {len(chunks)}")
#     return chunks


# def get_vectostore(text_chunks):
#     print('emd')
#     embeddings = AzureOpenAIEmbeddings(azure_deployment='text-embedding')
#     vectorstore = FAISS.from_documents(text_chunks, embedding=embeddings)
#     # vectorstore = []
#     # db1 = FAISS.from_texts(["test"], embedding=embeddings)
#     # for ele in text_chunks:
#     #     #print(ele)
#     #     print(FAISS.from_documents([ele], embedding=embeddings))
#     #     vectorstore.append(FAISS.from_documents([ele], embedding=embeddings))
#     #     db1.merge_from(FAISS.from_documents([ele], embedding=embeddings))
#     return vectorstore
# def get_vectostore(text_chunks):
#     embeddings = AzureOpenAIEmbeddings(azure_deployment='text-embedding')
#     vectorstore = FAISS.from_documents(text_chunks, embedding=embeddings)
#     # New_db = 'faiss_index'
#     # vectorstore = []
#     # New_db = FAISS.from_texts(["test"], embedding=embeddings)
#     # for ele in text_chunks:
#     #     #print(ele)
#     #     print(FAISS.from_documents([ele], embedding=embeddings))
#     #     vectorstore.append(FAISS.from_documents([ele], embedding=embeddings))
#     #     New_db.merge_from(FAISS.from_documents([ele], embedding=embeddings))
#     return vectorstore


# def get_vectostore_with_progress(text_chunks):
#     print('emd')
#     embeddings = AzureOpenAIEmbeddings(azure_deployment='text-embedding')
#     vectorstore = FAISS.from_documents(text_chunks, embedding=embeddings)
#
#     # Calculate progress data
#     total_chunks = len(text_chunks)
#     processed_chunks = 0
#     progress_data = []
#
#     for ele in text_chunks:
#         processed_chunks += 1
#         progress_percentage = int((processed_chunks / total_chunks) * 100)
#         progress_data.append({"label": f"Processed: {processed_chunks}/{total_chunks}", "value": progress_percentage})
#
#     return vectorstore, progress_data



Cognisergauge_fig = go.Figure(go.Indicator(
    mode="gauge+number+delta",
    value=70,
    domain={'x': [0, 1], 'y': [0, 1]},
    title={'text': "", 'font': {'size': 24}},
    delta={'reference': -10, 'increasing': {'color': "RebeccaPurple"}},
    gauge={
        'axis': {'range': [None, 100], 'tickwidth': 1, 'tickcolor': "darkblue"},
        'bar': {'color': "darkblue"},
        'bgcolor': "white",
        'borderwidth': 2,
        'bordercolor': "gray",
        'steps': [
            {'range': [0, 50], 'color': 'cyan'},
            {'range': [50, 100], 'color': 'royalblue'}],
        'threshold': {
            'line': {'color': "red", 'width': 4},
            'thickness': 0.75,
            'value': 70}}))

Cognisergauge_fig.update_layout(
    paper_bgcolor="white",
    height=180,
    width=250,
    margin=dict(l=50, r=0, t=0, b=0),  # Adjust as needed
    font={'color': "darkblue", 'family': "Arial"}
)

# # Get text data from form
# db_url = request.form.get('dbURL', '')
# username = request.form.get('username', '')
# password = request.form.get('password', '')
# try:
#     files = request.files.getlist('file')
#     print(files)
# # Now 'files' is a list of FileStorage objects
# # for file in files:
# #     chunks = get_chunks(file)
# #     final_chunks.extend(chunks)
# #     summary_chunk.append(chunks)
# # vectorstore = get_vectostore(final_chunks)
# # final_chunks_pickle = pickle.dumps(summary_chunk)
# # vectorstore.save_local("faiss_index")
# # with open('final_chunks.pkl', 'wb') as f:
# #     pickle.dump(summary_chunk, f)
#
# # finlal_chunks_pickle = pickle.dumps(final_chunks)
# # create conversation chain
# print(len(summary_chunk))
# print(len(final_chunks))
# # # Save final_chunks list to a pickle file
# # with open('final_chunks.pkl', 'wb') as f:
# #     pickle.dump(final_chunks, f)
#
# # Calculate percentages for pie chart every new upload file
# total_files_list = len(files)
# successful_list = tot_succ
# progress_list = total_files_list - successful_list
# failed_list = tot_fail
# print('pie chart value', total_files_list, successful_list, progress_list, failed_list)
#
# # for gauge chart
# over_all_readiness += total_files_list
# total_success_rate += tot_succ #
# print('gauge value store all', total_success_rate, over_all_readiness)
#
# {'redirect': url_for('Authenticate_Pin')}

#     return jsonify({'message': 'File successfully Uploaded'})
#
# except Exception as e:
#     app.logger.error(f"An error occurred: {str(e)}")
#     print(f"An error occurred: {str(e)}")
#     return jsonify({'error': 'An error occurred while processing the request.'})