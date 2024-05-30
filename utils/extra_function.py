# def get_chunks(file_obj):
#     with io.BytesIO(file_obj.file_data) as temp_file:
#         if file_obj.filename.endswith('.pdf'):
#             pdf_reader = PdfReader(temp_file)
#             chunks = [page.extract_text() for page in pdf_reader.pages]
#         elif file_obj.filename.endswith('.docx') or file_obj.filename.endswith('.doc'):
#             # Handle DOCX files
#             pass
#         elif file_obj.filename.endswith('.xlsx') or file_obj.filename.endswith('.xls'):
#             # Handle Excel files
#             pass
#         else:
#             chunks = []  # Handle other file types
#
#     return chunks


# # Get the latest file
# allowed_extensions = ('.pdf', '.doc', '.docx', '.xls', '.xlsx')
# query_conditions = [FileStorage.filename.endswith(ext) for ext in allowed_extensions]
# latest_file = FileStorage.query.filter(or_(*query_conditions)). \
#     order_by(FileStorage.id.desc()).first()
#
# print(latest_file)
# if latest_file:
#     # Get the chunks from the latest file
#     chunks = get_chunks(latest_file)
#
#     # Process the chunks and count successes/failures
#     successful_chunks = 0
#     failed_chunks = 0
#     for i, chunk in enumerate(chunks):
#         try:
#             # Example: Try to process the chunk
#             processed_result = process_chunk(chunk)
#             successful_chunks += 1
#         except Exception as e:
#             print(f"Failed to process chunk {i + 1}: {str(e)}")
#             failed_chunks += 1
#
#     # Display overall statistics
#     total_chunks = len(chunks)
#     print(f"Total chunks: {total_chunks}")
#     print(f"Successful chunks: {successful_chunks}")
#     print(f"Failed chunks: {failed_chunks}")
#
#     # Example: Concatenate all chunks into a single string
#     concatenated_text = '\n'.join(chunks)
#
#     # Further processing based on your requirements
#
#     # Create a pie chart using Plotly Express
#     fig_pie = px.pie(
#         values=[total_chunks, successful_chunks, failed_chunks],
#         names=['Total Text', 'Successful', 'Failed'],
#     )


# def process_chunk(chunk):
#     # Example processing logic
#     # You can customize this function based on your requirements
#     # If processing fails, raise an exception
#     if len(chunk) > 100:  # Example condition for successful processing
#         return "Processed Successfully"
#     else:
#         raise ValueError("Processing failed: Chunk is too short")


# safe file in db

# try:
#     if file:
#         file_data = file.read()
#         new_file = FileStorage(
#             filename=file.filename,
#             file_data=file_data,
#             file_description=request.form.get("description"),
#         )
#         db.session.add(new_file)
#         db.session.commit()
#
#         flash('File information successfully saved to the database', 'success')
# except Exception as e:
#     db.session.rollback()
#     flash(f'Error: {str(e)}', 'error')


# pie progress chart function
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


# import plotly.graph_objects as go
#
# labels = ['successful', 'progress', 'failed']
# values = [75, 15, 10]
#
# # Use `hole` to create a donut-like pie chart
# fig = go.Figure(data=[go.Pie(labels=labels, values=values, hole=.5)])
# fig.show()


# labels = ['Successful', 'In Progress', 'Failed']
# values = [0, 0, 0]
#
# pie_chart = go.Figure(data=[go.Pie(labels=labels, values=values, hoverinfo='label+percent',
#                                    textinfo='value', textfont=dict(size=3), hole=0.5)],
#                       layout=go.Layout(title='File Reading Status'))

# labels = ['Successful', 'In Progress', 'Failed']
# values = [10, 10, 10]
# total_value = sum(values)  # Calculate the total
#
# # Create the pie chart with a hole and center text
# pie_chart = go.Figure(data=[go.Pie(labels=labels,values=values, hole=.5)])
# pie_chart.update_layout(
#     width=220,  # Set width in pixels
#     height=170,  # Set height in pixels
#     margin=dict(l=10, r=60, t=50, b=20),
#     annotations=[dict(text=f"{total_value}", x=0.5, y=0.5, font_size=10, showarrow=False)],
# )
#
# # Optional: Customize text sizes for values and labels (adjust as needed)
# pie_chart.update_traces(textfont_size=10, textinfo='value')  # Adjust value text size
# pie_chart.update_layout(legend=dict(font_size=10))  # Adjust label text size (if legend is shown)





@app.route('/popup_form', methods=['POST'])
def popup_form():
    global tot_succ, tot_fail, total_files_list, successful_list, progress_list, failed_list
    global final_chunks_pickle, final_chunks, file_names, chat_history_list, over_all_readiness
    global total_success_rate, summary_chunk
    tot_succ = 0
    tot_fail = 0
    total_files_list = None
    successful_list = None
    progress_list = None
    failed_list = None
    file_names = []
    chat_history_list = []

    db_url = request.form.get('dbURL', '')
    username = request.form.get('username', '')
    password = request.form.get('password', '')
    print("Database information..  ", db_url, username, password)
    if request.method == 'POST':
        if 'myFile' not in request.files:
            return jsonify({'message': 'No file uploaded'}), 400

        files = request.files.getlist('myFile')
        print('name of file is', files)

        # total_size = sum(f.content_length for f in files)
        # if total_size > 200 * 1024 * 1024:  # 200 MB limit
        #     return jsonify({'error': 'Total file size exceeds maximum limit of 200 MB'}), 400

        for file in files:
            if file.filename == '':
                return jsonify({'message': 'Invalid file'}), 400

            for file in files:
                chunks = get_chunks(file)
                final_chunks.extend(chunks)
                summary_chunk.append(chunks)

            # vectorstore = get_vectostore(final_chunks)
            # # final_chunks_pickle = pickle.dumps(summary_chunk)
            # vectorstore.save_local("faiss_index")
            # with open('final_chunks.pkl', 'wb') as f:
            #     pickle.dump(summary_chunk, f)

            # finlal_chunks_pickle = pickle.dumps(final_chunks)
            # create conversation chain
            print(len(summary_chunk))
            print(len(final_chunks))
            # # Save final_chunks list to a pickle file
            # with open('final_chunks.pkl', 'wb') as f:
            #     pickle.dump(final_chunks, f)

            # Calculate percentages for pie chart every new upload file
            total_files_list = len(files)
            successful_list = tot_succ
            progress_list = total_files_list - successful_list
            failed_list = tot_fail
            print('pie chart value', total_files_list, successful_list, progress_list, failed_list)

            # for gauge chart
            over_all_readiness += total_files_list
            total_success_rate += tot_succ
            print('gauge value store all', total_success_rate, over_all_readiness)

        return jsonify({'message': 'Files uploaded successfully'}), 200
    else:
        return jsonify({'message': 'Invalid request method'}), 405

    #
    # chunks_dict = {}  # Dictionary to store chunks for each file
    #
    # for file in files:
    #     chunks = get_chunks(file)
    #     final_chunks.extend(chunks)
    #     file_name = file.filename
    #
    #     # If the file is not in the dictionary, add its chunks
    #     if file_name not in chunks_dict:
    #         chunks_dict[file_name] = chunks
    #     else:
    #         # If the file is already in the dictionary, extend its chunks
    #         chunks_dict[file_name].extend(chunks)
    #
    # # Append chunks for each file to summary_chunk
    # for file_name, file_chunks in chunks_dict.items():
    #     # Convert chunks to strings before joining
    #     str_chunks = [' '.join(map(str, chunk)) for chunk in file_chunks]
    #     summary_chunk.append(str_chunks)

    # for file in files:
    #     chunks = get_chunks(file)
    #     final_chunks.extend(chunks)
    #     summary_chunk.append(chunks)

    # for file_n, page_content_tuples in zip(file_names, myEntry):
    #     for index, page_content_tuple in enumerate(page_content_tuples):
    #         page_content = page_content_tuple  # No need to unpack the tuple
    #
    #         # Pass the page content to the custom_summary function
    #         summary = custom_summary([page_content], llm, custom_p, chain_type)
    #
    #         key = f'{file_n}-{counter}'
    #         summary_dict = {'key': key, 'value': summary}
    #         summ.append(summary_dict)
    #         counter += 1
    #
    # print(summ)
    # file_names1 = ['Mohd Asif Ansari']
    # for file_n, ele in zip(file_names1, myEntry):
    #     for els in ele:
    #         summary = custom_summary([els], llm, custom_p, chain_type)
    #         key = f'{file_n}--{counter}-- '
    #         summary_dict = {'key': key, 'value': summary}
    #         summ.append(summary_dict)
    #         counter += 1
    # print(summary_chunk)
    # for ele in summary_chunk:
    #     summary = custom_summary(ele, llm, custom_p, chain_type)
    #     key = f'{ele.key}--{counter}-- '
    #     summary_dict = {'key': key, 'value': summary}
    #     summ.append(summary_dict)
    #     counter += 1
    # print(summary_chunk)

    # summ = []
    # counter = 1
    # # Loop through your data
    # for entry in myEntry:
    #     for filename, documents_list in entry.items():
    #         for document in documents_list:
    #             summary = custom_summary(document, llm, custom_p, chain_type)
    #             # Construct the key and summary dictionary
    #             key = f'{filename}--{counter}--'
    #             summary_dict = {'key': key, 'value': summary}
    #             # Append the summary dictionary to the list
    #             summ.append(summary_dict)
    #             # Increment the counter
    #             counter += 1
    #
    # print("Summaries:", summ)