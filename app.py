import shutil
import os
import time
import base64
import json
from io import BytesIO

from flask import Flask, jsonify, url_for, flash
from flask import render_template, request, g, redirect, session
from flask_sqlalchemy import SQLAlchemy
import tempfile
import pickle

# sentiment and word cloud use only
import nltk
from nltk.tokenize import word_tokenize
from wordcloud import WordCloud
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from nltk.corpus import stopwords

# for azure credentials use only
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient, BlobClient, ContentSettings, BlobProperties
from azure.identity import ClientSecretCredential
from azure.keyvault.secrets import SecretClient
from dotenv import load_dotenv

# langchain module
from langchain.chat_models import AzureChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains.summarize import load_summarize_chain
from langchain_community.document_loaders import AzureBlobStorageFileLoader, PyPDFLoader, Docx2txtLoader, \
    UnstructuredExcelLoader, \
    AssemblyAIAudioTranscriptLoader, CSVLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.chat_models import AzureChatOpenAI
# from langchain_community.embeddings import AzureOpenAIEmbeddings
from langchain_openai import AzureOpenAIEmbeddings
from langchain_community.vectorstores.azuresearch import AzureSearch
from langchain.vectorstores import AzureSearch
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain

# for mp3 to pdf
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
# for webscraping
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

# for EDA
import pandas as pd
import matplotlib
from pandasai import Agent
from pandasai.llm import AzureOpenAI

matplotlib.use('Agg')

# for logging use
import logging
from logging.handlers import TimedRotatingFileHandler
import traceback
import csv
from datetime import datetime

# Socket IO
from flask_socketio import SocketIO, emit, send

# For database connection
import pyodbc, datetime
import pymongo
from flask import send_file
import mysql.connector
from pymongo import MongoClient
import traceback
import io

# for default Azure account use only
vectorsecret = "vectordatabsekey"
openapi_key = "OPENAI-API-KEY"
KVUri = f"https://eavault.vault.azure.net/"
credential = DefaultAzureCredential()
client = SecretClient(vault_url=KVUri, credential=credential)
retrieved_secret = client.get_secret(openapi_key)
main_key = retrieved_secret.value
retrieved = client.get_secret(vectorsecret)
vector_store = retrieved.value

# # for local use only
# load_dotenv()
# main_key = os.environ["Main_key"]
# vector_store = os.environ["AZURE_COGNITIVE_SEARCH_API_KEY"]


os.environ["OPENAI_API_TYPE"] = "azure"
os.environ["OPENAI_API_KEY"] = main_key
os.environ["OPENAI_API_VERSION"] = "2023-05-15"
os.environ["AZURE_OPENAI_ENDPOINT"] = "https://ea-openai.openai.azure.com/"

# for vector db
vector_store_address = "https://cognilink-vectordb.search.windows.net"
vector_store_password = vector_store

# 1 - text-embedding-3large testing  2- text-embedding
embeddings = AzureOpenAIEmbeddings(azure_deployment='text-embedding')

chunk_size = 8000
chunk_overlap = 400
custom_prompt = ''
chain_type = 'map_reduce'
num_summaries = 1

# logger variable:
logger = ''
summary_word_cpunt = 0
blob_list_length = 0
tot_file = 0
tot_succ = 0
tot_fail = 0
Limit_By_Size = 0
Source_URL = ""
bar_chart_url = {}
# word cloud
text_word_cloud = ''

# nltk library download
nltk.download('vader_lexicon')
nltk.download('stopwords')
nltk.download('punkt')

# # blob storage use locally.
# account_name = os.environ['account_name']
# account_key = os.environ['account_key']
# container_name = os.environ['container_name']
# # Create a BlobServiceClient object
# connection_string = f"DefaultEndpointsProtocol=https;AccountName={account_name};AccountKey={account_key};EndpointSuffix=core.windows.net"
# blob_service_client = BlobServiceClient.from_connection_string(connection_string)
# container_client = blob_service_client.get_container_client(container_name)


# for Azure server use only
account_name = "testcongnilink"
container_name = "congnilink-container"

account_url = "https://testcongnilink.blob.core.windows.net"
default_credential = DefaultAzureCredential()

blob_service_client = BlobServiceClient(account_url, credential=default_credential)
container_client = blob_service_client.get_container_client(container_name)

def set_model():
    model = session.get('engine', 'gpt-4-0125-preview')  # Default to 'gpt-4-0125-preview'
    if model == "GPT-3.5 turbo":
        deployment_name = "gpt-35-turbo"
    elif model == "GPT-4":
        deployment_name = "gpt-4-0125-preview"
    elif model == "GPT-4o":
        deployment_name = ""  # upcoming
    else:
        deployment_name = "gpt-4-0125-preview"
    return deployment_name


def create_or_pass_folder(container_client, session):
    """
     Creates a folder in the specified Azure Blob Storage container if it does not already exist.

     Args:
         container_client (BlobServiceClient): Azure Blob Service client instance.
         session (dict): User session dictionary containing the 'login_pin'.

     Returns:
         str: Message indicating the result of the folder creation process.

     Side Effects:
         Sets the global variable `g.flag` to 1 on success and 0 on failure.
         Logs the success or failure of the folder creation process.
     """
    container_name = "congnilink-container"

    if 'login_pin' in session:
        user_folder = str(session['login_pin'])
        try:
            container_client.get_blob_client(container_name, user_folder).upload_blob("")
            print('successfully created')
            g.flag = 1  # Set flag to 1 on success1
            logger.info(f"Function create_or_pass_folder successfully created folder")
            return f"Folder '{user_folder}' successfully created."
        except Exception as e:
            g.flag = 0  # Set flag to 1 on success1
            logger.error(f"Function create_or_pass_folder error",exc_info=True)
            if "BlobNotFound" in str(e):
                try:
                    container_client.get_blob_client(container_name, user_folder).create_container()
                    return f"Folder '{user_folder}' successfully created."
                except Exception as e:
                    return f"Error creating folder '{user_folder}': {str(e)}"
            else:
                g.flag = 0
                logger.error(f"Function create_or_pass_folder Error creating folder'{user_folder}': {str(e)} ",exc_info=True)
                return f"Error creating folder '{user_folder}': {str(e)}"
    else:
        g.flag = 0
        logger.error(f"Function create_or_pass_folder login_pin' not found in session. ", exc_info=True)
        return "Error: 'login_pin' not found in session."


def upload_to_blob(file_content, session, blob_service_client, container_name):
    """Uploads a file to Azure Blob Storage with enhanced security and error handling.

    Args:
        file_content (http.MultipartFile): The file object to upload.
        session (dict): User session dictionary.
        blob_service_client (BlobServiceClient): Azure Blob Service client instance.
        container_name (str): Name of the Azure Blob Storage container.

    Returns:
        str: URL of the uploaded blob or an error message.
    """
    global blob_client

    if 'login_pin' not in session:
        return "Error: 'login_pin' not found in session."
    try:
        folder_name = str(session['login_pin'])

        blob_name = f"{folder_name}/{file_content.filename}"
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)

        # Read the content of file_content
        content = file_content.read()

        # # Upload the content to Azure Blob Storage, overwriting the existing blob if it exists
        # blob_client.upload_blob(content, blob_type="BlockBlob",
        #                         content_settings=ContentSettings(content_type="application/octet-stream"),
        #                         overwrite=True)
        # Upload with overwrite and proper content type handling
        blob_client.upload_blob(content, blob_type="BlockBlob",
                                content_settings=ContentSettings(content_type=file_content.content_type),
                                overwrite=True)
    except Exception as e:
        g.flag = 0  # Set flag to 1 on success1
        logger.error(f"Function upload_to_blob error", exc_info=True)
        print('upload_to_blob----->', str(e))

    # Return the URL of the uploaded Blob
    g.flag = 1  # Set flag to 1 on success1
    logger.info(f"Function upload_to_blob successfully created blob_client.url")
    return blob_client.url


def update_bar_chart_from_blob(session, blob_service_client, container_name):
    """
    Updates a bar chart in the user session based on the types of files in a specified Azure Blob Storage folder.

    Args:
        session (dict): User session dictionary containing the 'login_pin'.
        blob_service_client (BlobServiceClient): Azure Blob Service client instance.
        container_name (str): Name of the Azure Blob Storage container.

    Returns:
        list: List of blobs in the specified folder.

    Side Effects:
        Updates the 'bar_chart_ss' in the session with the count of different file types.
        Emits a 'update_bar_chart' event via socketio to notify clients about the updated bar chart.
        Sets the global variable `g.flag` to 1 on success and 0 on failure.
        Logs the success or failure of the bar chart update process.
    """
    bar_chart = {}
    blob_list = []
    try:
        # Get the folder name from the session
        folder_name = str(session['login_pin'])
        # Get a list of blobs in the specified folder
        blob_list = blob_service_client.get_container_client(container_name).list_blobs(name_starts_with=folder_name)
        # print("blob_list------?", blob_list)

        # Iterate through each blob in the folder
        for blob in blob_list:
            file_name = blob.name.split('/')[-1]  # Extract file name from blob path

            # Update the bar_chart dictionary based on file type
            if file_name.endswith('.pdf') or file_name.endswith('.PDF'):
                file_type = 'PDF'
            elif file_name.endswith('.docx') or file_name.endswith('.doc'):
                file_type = 'DOCX'
            elif file_name.endswith('.csv') or file_name.endswith('.CSV'):
                file_type = 'CSV'
            elif file_name.endswith('.mp3'):
                file_type = 'MP3'
            elif file_name.endswith('.xlsx') or file_name.endswith('.xlscd .'):
                file_type = 'XLSX'
            else:
                file_type = 'Other'

            # Update bar_chart dictionary
            if file_type in bar_chart:
                bar_chart[file_type] += 1
            else:
                bar_chart[file_type] = 1
        session['bar_chart_ss'].update(bar_chart)
        # Emit an event to notify clients about the updated bar chart
        socketio.emit('update_bar_chart', {
            'labels': list(bar_chart.keys()),
            'values': list(bar_chart.values()),
            'pin' : session['login_pin']
        })
        g.flag = 1  # Set flag to 1 on success1
        logger.info(f"Function update_bar_chart_from_blob successfully Return blob_list")
    except Exception as e:
        g.flag = 0  # Set flag to 1 on success1
        logger.error(f"Function update_bar_chart_from_blob error", exc_info=True)
        print('blob_list error------>', str(e))

    # Return the updated bar_chart dictionary
    return blob_list


def update_when_file_delete():
    """
    Updates session and charts when a file is deleted from Azure Blob Storage.

    Side Effects:
        Sets the global variables related to blob list, source URL, loader, total files, bar chart URL, and txt to PDF.
        Updates session counts for various metrics.
        Logs the success or failure of the file update process.
        Emits events to update charts on the client side.

    Returns:
        Response: JSON response indicating the result of the operation.
    """
    global blob_list_length, Source_URL, loader, tot_file, bar_chart_url, txt_to_pdf
    txt_to_pdf = {}
    bar_chart_url = {}
    blob_list_length = 0
    tot_succ = 0
    tot_fail = 0
    final_chunks = []
    summary_chunk = []

    # Lists to store progress of files loading
    session['embedding_not_created'] = []
    session['failed_files'] = []
    session['progress_files'] = []

    folder_name_azure = str(session['login_pin'])
    folder_name = os.path.join('static', 'login', folder_name_azure)
    all_blobs = blob_service_client.get_container_client(container_name).list_blobs(name_starts_with=folder_name_azure)
    # print(all_blobs)
    all_blobs_list = list(all_blobs)  # Convert to list to enable filtering

    for blob in all_blobs_list:
        file_name = blob.name.split('/')[-1]  # Extract file name from blob path

        if file_name.endswith('.csv') or file_name.endswith('.CSV'):
            session['progress_files'].append(file_name)
            socketio.emit('success', session['progress_files'])

    blob_list = [blob for blob in all_blobs_list if not (blob.name.endswith('.csv') or blob.name.endswith('.CSV'))]
    # print(blob_list)

    # Update session counts for CSV files directly
    csv_files_count = len(all_blobs_list) - len(blob_list)
    tot_succ += csv_files_count  # Mark CSV files as successfully read
    blob_list_length = len(blob_list)
    if blob_list_length == 0 and Source_URL == "":
        session['bar_chart_ss'] = {}
        session['over_all_readiness'] = 0
        session['total_success_rate'] = 0
        session['total_files_list'] = 0
        session['successful_list'] = 0
        session['failed_list'] = 0
        session['progress_list'] = 0
        print("No data Load in storage")
        return jsonify({'message': 'No data Load in storage'})

    session['total_files_list'] = blob_list_length + csv_files_count

    try:
        if blob_list_length != 0:
            for blob in blob_list:
                blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob.name)
                file_name = blob.name.split('/')[-1]  # Extract file name from blob path
                print("blob_name_file_name---------->", file_name)
                if file_name.endswith('.pdf') or file_name.endswith('.PDF') or file_name.endswith('.mp3'):
                    temp_path = blob_client.url
                elif file_name.endswith('.xls') or file_name.endswith('.xlsx') or file_name.endswith(
                        '.docx') or file_name.endswith('.doc'):
                    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                        temp_path = temp_file.name
                        blob_data = blob_client.download_blob()
                        blob_data.readinto(temp_file)

                    # loader = AzureBlobStorageFileLoader(
                    #     conn_str=connection_string,
                    #     container=container_name,
                    #     blob_name=blob.name
                    # )
                if '.pdf' in file_name or '.PDF' in file_name:
                    loader = PyPDFLoader(temp_path)
                    session['embedding_not_created'].append(file_name)
                    socketio.emit('pending', session['embedding_not_created'])

                elif '.mp3' in file_name:
                    loader = AssemblyAIAudioTranscriptLoader(temp_path, api_key="5bbe5761b36b4ff885dbd18836c3c723")
                    session['embedding_not_created'].append(file_name)
                    socketio.emit('pending', session['embedding_not_created'])

                elif '.docx' in file_name or '.doc' in file_name:
                    loader = Docx2txtLoader(temp_path)
                    session['embedding_not_created'].append(file_name)
                    socketio.emit('pending', session['embedding_not_created'])

                elif '.xlsx' in file_name or '.xls' in file_name:
                    loader = UnstructuredExcelLoader(temp_path)
                    session['embedding_not_created'].append(file_name)
                    socketio.emit('pending', session['embedding_not_created'])

                s_url = 'https://testcongnilink.blob.core.windows.net/congnilink-container/' + blob.name
                chunks = loader.load_and_split()
                for ele in chunks:
                    ele.metadata['source'] = s_url
                print(f"Number of chunks :: {len(chunks)}")
                if len(chunks) == 0:
                    tot_fail += 1
                    # Failed files list
                    session['failed_files'].append(file_name)
                    jsonify({"message": f"No Text Available in {file_name} In This File."})
                final_chunks.extend(chunks)
                summary_chunk.append({file_name: [chunks]})

                if '.mp3' in file_name and len(chunks) != 0:
                    for i, chunk in enumerate(chunks):
                        txt_to_pdf[f"{file_name}_{i + 1}"] = chunk.page_content
                    # Split file_name at the dot and append ".pdf" to the first part
                    file_name_without_extension = file_name.split('.')[0]
                    temp_pdf_path = os.path.join(folder_name, f"{file_name_without_extension}.pdf")

                    doc = SimpleDocTemplate(temp_pdf_path, pagesize=letter)
                    styles = getSampleStyleSheet()
                    flowables = []

                    for name, text in txt_to_pdf.items():
                        ptext = "<font size=12><b>{}<br/><br/></b></font>{}".format(name, text)
                        paragraph = Paragraph(ptext, style=styles["Normal"])
                        flowables.append(paragraph)
                        flowables.append(Paragraph("<br/><br/><br/>", style=styles["Normal"]))

                    doc.build(flowables)
                    session['progress_files'].append(file_name)
                    # Get the filename from the path
                    file_name = os.path.basename(temp_pdf_path)
                    with open(temp_pdf_path, "rb") as file:
                        content = file.read()
                    blob_name = f"{folder_name_azure}/{file_name}"
                    blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)

                    # Upload the content to Azure Blob Storage, overwriting the existing blob if it exists
                    blob_client.upload_blob(content, blob_type="BlockBlob",
                                            content_settings=ContentSettings(content_type="application/pdf"),
                                            overwrite=True)
                    session['progress_files'].append(file_name)

                    # Delete Temporary PDF file
                    os.remove(temp_pdf_path)

                tot_succ += 1
                if file_name not in session['failed_files']:
                    session['progress_files'].append(file_name)
                for file_name in session['embedding_not_created']:
                    session['embedding_not_created'].remove(file_name)

                # Calculate progress_list
                session['successful_list'] = min(tot_succ - tot_fail, session['total_files_list'])
                session['failed_list'] = min(tot_fail, session['total_files_list'] - session['successful_list'])
                session['progress_list'] = session['total_files_list'] - session['successful_list'] - session[
                    'failed_list']
                with open(os.path.join(folder_name, 'summary_chunk.pkl'), 'wb') as f:
                    pickle.dump(summary_chunk, f)

                vectorstore = get_vectostore(final_chunks)
                # vectorstore.save_local(os.path.join(folder_name, 'faiss_index'))
                session['over_all_readiness'] = session['total_files_list']
                session['total_success_rate'] = session['successful_list']
                # Check if session is modified and save it if necessary
                # if session.modified:
                #     # Manually save the session
                #     session_interface = app.session_interface
                #     session_interface.save_session(app, session, None)

                pie_chart_data = create_pie_chart()
                socketio.emit('updatePieChart', pie_chart_data)
                socketio.emit('pending', session['embedding_not_created'])
                socketio.emit('failed', session['failed_files'])
                socketio.emit('success', session['progress_files'])

                update_bar_chart_from_blob(session, blob_service_client, container_name)

                gauge_source_chart_data = gauge_chart_auth()
                socketio.emit('update_gauge_chart', gauge_source_chart_data)
        if Source_URL != "":
            session['total_files_list'] += 1
            f_name_url = Source_URL
            file_type = 'Source_Url'
            bar_chart_url[file_type] = bar_chart_url.get(file_type, 0) + 1
            # Update bar_chart_url with values from session, if available
            if 'bar_chart_ss' in session:
                session['bar_chart_ss'].update(bar_chart_url)
            loader = WebBaseLoader(Source_URL)
            chunks_url = loader.load_and_split()
            print(f"Number of chunks :: {len(chunks_url)}")
            if len(chunks_url) == 0:
                tot_fail += 1
                return jsonify({"message": "No data available in website"})
            final_chunks.extend(chunks_url)
            summary_chunk.append({f_name_url: [chunks_url]})
            tot_succ += 1
            # Calculate progress_list
            session['successful_list'] = min(tot_succ - tot_fail, session['total_files_list'])
            session['failed_list'] = min(tot_fail, session['total_files_list'] - session['successful_list'])
            session['progress_list'] = session['total_files_list'] - session['successful_list'] - session['failed_list']
            with open(os.path.join(folder_name, 'summary_chunk.pkl'), 'wb') as f:
                pickle.dump(summary_chunk, f)

            get_vectostore(final_chunks)
            # vectorstore.save_local(os.path.join(folder_name, 'faiss_index'))
            session['over_all_readiness'] = session['total_files_list']
            session['total_success_rate'] = session['successful_list']

            # session_interface.save_session(app, session)
            update_bar_chart_from_blob(session, blob_service_client, container_name)
            pie_chart_data = create_pie_chart()
            socketio.emit('updatePieChart', pie_chart_data)
            gauge_source_chart_data = gauge_chart_auth()
            socketio.emit('update_gauge_chart', gauge_source_chart_data)

        socketio.emit('pending', session['embedding_not_created'])
        socketio.emit('failed', session['failed_files'])
        socketio.emit('success', session['progress_files'])
        print("Complete")
        g.flag = 1  # Set flag to 1 on success1
        logger.info(f"Function update_when_file_delete Data Loaded Successfully")
        return jsonify({"message": "Data Loaded Successfully"})
    except Exception as e:
        g.flag = 0  # Set flag to 1 on success1
        logger.error(f"Function update_when_file_delete error", exc_info=True)
        print("update_when_file_delete----->", str(e))
        return jsonify({'message': str(e)})


def generate_word_cloud(text_word_cloud):
    """
    Generates a word cloud image from the provided text and saves it to a file.

    Args:
        text_word_cloud (str): The text to be used for generating the word cloud.

    Side Effects:
        Saves the generated word cloud image to a file in the user's folder.

    Returns:
        None
    """
    # Tokenize karein
    tokens = word_tokenize(text_word_cloud)

    # Generate WordCloud with specified width and height
    wordcloud = WordCloud(width=1200, height=800,
                          background_color='white',
                          min_font_size=10).generate(' '.join(tokens))
    folder_name = str(session['login_pin'])

    # Save the WordCloud image to a file
    wordcloud.to_file(f'static/login/{folder_name}/wordcloud.png')


def get_vectostore(text_chunks):
    """
    Creates and updates an AzureSearch vector store with the given text chunks.

    Args:
        text_chunks (list): A list of text chunks to be added to the vector store.

    Side Effects:
        Adds the provided text chunks to the AzureSearch vector store.

    Returns:
        None
    """
    index_name: str = str(session['login_pin'])
    vector_store: AzureSearch = AzureSearch(
        azure_search_endpoint=vector_store_address,
        azure_search_key=vector_store_password,
        index_name=index_name,
        embedding_function=embeddings.embed_query,
    )
    vector_store.add_documents(text_chunks)


def get_conversation_chain(vectorstore):
    """
    Retrieves a conversation chain for conversational retrieval using Azure models.

    Args:
        vectorstore: The AzureSearch vector store instance.

    Returns:
        ConversationalRetrievalChain: A conversation chain for conversational retrieval.
    """
    # llm = AzureChatOpenAI(azure_deployment="gpt-35-turbo")
    deployment_name = set_model()
    llm = AzureChatOpenAI(azure_deployment=deployment_name)
    template = """Use the following pieces of context to answer the question at the end. If you don't know the answer, 
    just say that you don't know, don't try to make up an answer. Use three sentences maximum. Keep the answer as concise as possible. 
    {context}
    Question: {question}
    Helpful Answer:"""
    CUSTOM_QUESTION_PROMPT = PromptTemplate(input_variables=["context", "question"], template=template)
    memory = ConversationBufferMemory(memory_key="chat_history", input_key='question', return_messages=True,
                                      output_key="answer")
    conversation_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectorstore.as_retriever(),
        memory=memory,
        return_source_documents=True
    )
    return conversation_chain


def custom_summary(docs, custom_prompt, chain_type):
    """
    Generates custom summaries for the provided documents using Azure models.

    Args:
        docs (list): List of documents to be summarized.
        custom_prompt (str): Custom prompt template for summarization.
        chain_type (str): Type of summarization chain.

    Returns:
        list: List of custom summaries.
    """
    custom_prompt = custom_prompt + """:\n {text}"""
    COMBINE_PROMPT = PromptTemplate(template=custom_prompt, input_variables=["text"])
    MAP_PROMPT = PromptTemplate(template="Summarize:\n{text}", input_variables=["text"])
    model = session['engine']
    print("summary---->session['engine']---->", model)
    deployment_name = set_model()
    llm = AzureChatOpenAI(azure_deployment=deployment_name, model_name=model, temperature=0.50)

    if chain_type == "map_reduce":
        chain = load_summarize_chain(llm, chain_type=chain_type,
                                     map_prompt=MAP_PROMPT,
                                     combine_prompt=COMBINE_PROMPT)
    else:
        chain = load_summarize_chain(llm, chain_type=chain_type)

    summaries = chain({"input_documents": docs}, return_only_outputs=True)["output_text"]
    # summaries = []
    # for i in range(num_summaries):
    #     summary_output = chain({"input_documents": docs}, return_only_outputs=True)["output_text"]
    #     summaries.append(summary_output)
    # print(summaries)
    return summaries


# ## End Summarization section --------


app = Flask(__name__, template_folder="Templates")
app.debug = True
app.static_folder = "static"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///Dashboard.db"
app.config['DEBUG'] = True
db = SQLAlchemy(app)
app.secret_key = os.urandom(24)
socketio = SocketIO(app, manage_session=True)


# Define FileStorage table
class FileStorage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    file_data = db.Column(db.LargeBinary)
    file_description = db.Column(db.Text)
    created_date = db.Column(db.DateTime, default=db.func.current_timestamp())


# Define UserRoles table
class UserRole(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    role_id = db.Column(db.String(10), unique=True, nullable=False)
    user_details = db.relationship('UserDetails', backref='user_role', lazy=True)


# Define UserDetails table
class UserDetails(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    role_id = db.Column(db.String(10), db.ForeignKey('user_role.role_id'), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email_id = db.Column(db.String(100), unique=True, nullable=False)
    created_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    modified_date = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    status = db.Column(db.String(20), nullable=False)
    login_pin = db.Column(db.String(20), nullable=False)


def analyze_sentiment_summ(senti_text_summ):
    """
     Analyzes the sentiment of the provided text and emits the sentiment data.

     Args:
         senti_text_summ (str): The text for sentiment analysis.

     Side Effects:
         Emits sentiment data via socketio.

     Returns:
         None
     """

    # Initialize the Vader Sentiment Intensity Analyzer
    sid = SentimentIntensityAnalyzer()

    # Analyze sentiment
    sentiment_scores = sid.polarity_scores(senti_text_summ)
    # print("Sentiment scores:", sentiment_scores)

    # Calculate percentages
    total = sentiment_scores['pos'] + sentiment_scores['neg'] + sentiment_scores['neu']
    senti_Positive_summ = sentiment_scores['pos'] / total * 100
    senti_Negative_summ = sentiment_scores['neg'] / total * 100
    senti_neutral_summ = sentiment_scores['neu'] / total * 100

    x1 = [senti_Positive_summ, senti_Negative_summ, senti_neutral_summ]
    y1 = ['Positive', 'Negative', 'Neutral']
    pin = session['login_pin']

    senti = {'values': x1, 'labels': y1, 'pin': pin}
    # print("Emitting sentiment data:", senti)

    socketio.emit('analyze_sentiment_summ', senti)


def analyze_sentiment_Q_A(senti_text_Q_A):
    """
    Analyzes the sentiment of a given text using Vader Sentiment Intensity Analyzer.

    Parameters:
        text (str): The input text for sentiment analysis.

    Returns:
        dict: A dictionary containing the percentages of positive, negative, and neutral sentiments.
    """
    # Initialize the Vader Sentiment Intensity Analyzer
    sid = SentimentIntensityAnalyzer()

    # Analyze sentiment
    sentiment_scores = sid.polarity_scores(senti_text_Q_A)

    # Calculate percentages
    # total = sum(abs(score) for score in sentiment_scores.values())
    total = sentiment_scores['pos'] + sentiment_scores['neg'] + sentiment_scores['neu']
    senti_Positive_Q_A = sentiment_scores['pos'] / total * 100
    senti_Negative_Q_A = sentiment_scores['neg'] / total * 100
    senti_neutral_Q_A = sentiment_scores['neu'] / total * 100

    x1 = [senti_Positive_Q_A, senti_Negative_Q_A, senti_neutral_Q_A]
    y1 = ['Positive', 'Negative', 'Neutral']
    pin = session['login_pin']
    senti_Q_A = {'values': x1, 'labels': y1, 'pin': pin}
    socketio.emit('analyze_sentiment_Q_A', senti_Q_A)


def create_bar_chart():
    """
    Creates a bar chart data dictionary based on the session's bar chart data.

    Returns:
        dict: A dictionary containing x and y values for the bar chart.
    """
    # update_bar_chart_from_blob(session, blob_service_client, container_name)
    bar_chart = session['bar_chart_ss']
    # print(bar_chart)
    # Check if 'bar_chart_ss' exists in session
    if bar_chart:
        x1 = list(bar_chart.values())  # Values for the bars
        y1 = list(bar_chart.keys())  # Labels for the bars
        pin = session['login_pin']
    else:
        x1 = [0]  # Values for the bars
        y1 = ["PDF"]  # Labels for the bars
        pin = session['login_pin']

    file_bar = {'values': x1, 'labels': y1, 'pin' : pin}

    # bar_json_graph = pio.to_json(file_bar)
    return file_bar


def perform_lda___Q_A(chat_history_list, num_topics=1, n_top_words=5):
    """
    Performs Latent Dirichlet Allocation (LDA) on the provided chat history to extract topics and their top words.

    Args:
        chat_history_list (list): A list of strings containing chat history.
        num_topics (int): Number of topics to extract (default is 1).
        n_top_words (int): Number of top words per topic (default is 5).

    Side Effects:
        Emits LDA topics and their top words via socketio.

    Returns:
        None
    """
    lda_topics_Q_A = {'keywords': set()}
    # Declare the global variable

    # Tokenization and stop words removal
    stop_words = set(stopwords.words('english'))

    def preprocess_text(text):
        tokens = word_tokenize(text.lower())
        tokens = [token for token in tokens if token not in stop_words]
        return ' '.join(tokens)

    # Preprocess conversation text
    processed_conversation = preprocess_text(chat_history_list)

    # Create a CountVectorizer to convert text to a matrix of token counts
    vectorizer = CountVectorizer(stop_words='english')
    X = vectorizer.fit_transform([processed_conversation])

    # Fit the LDA model
    lda = LatentDirichletAllocation(n_components=num_topics, random_state=42)
    lda.fit(X)

    # Aggregate all keywords from each topic
    for topic in lda.components_:
        keywords = [vectorizer.get_feature_names_out()[i] for i in topic.argsort()[:-n_top_words - 1:-1]]
        lda_topics_Q_A['keywords'].update(keywords)  # Add keywords to the set

    lda_topics_Q_A['keywords'] = list(lda_topics_Q_A['keywords'])  # Convert set to list before emitting
    lda_topics_Q_A['pin'] = session['login_pin']

    # # Store topics and their top words in lda_topics_Q_A dictionary
    # for topic_idx, topic in enumerate(lda.components_):
    #     topic_key = f"Topic{topic_idx + 1}"
    #     lda_topics_Q_A[topic_key] = [vectorizer.get_feature_names_out()[i] for i in
    #                                  topic.argsort()[:-n_top_words - 1:-1]]

    g.flag = 1
    logger.info('QnA topics generated.')
    # Return lda_topics_Q_A
    socketio.emit('lda_topics_QA', lda_topics_Q_A)


# def perform_lda____summ(senti_text_summ, num_topics=1, n_top_words=3):
#     """
#     Performs Latent Dirichlet Allocation (LDA) on the provided text for sentiment analysis to extract topics and their top words.
#
#     Args:
#         senti_text_summ (str): The text for sentiment analysis.
#         num_topics (int): Number of topics to extract (default is 2).
#         n_top_words (int): Number of top words per topic (default is 3).
#
#     Side Effects:
#         Emits LDA topics and their top words via socketio.
#
#     Returns:
#         None
#     """
#     lda_topics_summ = {}
#     # Tokenization and stop words removal
#     stop_words = set(stopwords.words('english'))
#
#     def preprocess_text(text):
#         tokens = word_tokenize(text.lower())
#         tokens = [token for token in tokens if token not in stop_words]
#         return ' '.join(tokens)
#
#     # Preprocess conversation text
#     processed_conversation = preprocess_text(senti_text_summ)
#
#     # Create a CountVectorizer to convert text to a matrix of token counts
#     vectorizer = CountVectorizer(stop_words='english')
#     X = vectorizer.fit_transform([processed_conversation])
#
#     # Fit the LDA model
#     lda = LatentDirichletAllocation(n_components=num_topics, random_state=42)
#     lda.fit(X)
#
#     # Add the user's pin to the dictionary
#     lda_topics_summ['pin'] = session['login_pin']
#
#     # Store topics and their top words in lda_topics_summ dictionary
#     for topic_idx, topic in enumerate(lda.components_):
#         topic_key = f"Topic{topic_idx + 1}"
#         lda_topics_summ[topic_key] = [vectorizer.get_feature_names_out()[i] for i in
#                                       topic.argsort()[:-n_top_words - 1:-1]]
#
#     # Emit the dictionary which now includes the pin
#     socketio.emit('lda_topics_summ', lda_topics_summ)

def perform_lda____summ(senti_text_summ, num_topics=1, n_top_words=3):
    """
    Performs Latent Dirichlet Allocation (LDA) on the provided text for sentiment analysis to extract unique keywords and sends them with the user pin.

    Args:
        senti_text_summ (str): The text for sentiment analysis.
        num_topics (int): Number of topics to extract.
        n_top_words (int): Number of top words per topic.

    Side Effects:
        Emits LDA topics and their top words via socketio, along with the user pin.

    Returns:
        None
    """
    lda_topics_summ = {'keywords': set()}  # Use a set to collect unique keywords
    stop_words = set(stopwords.words('english'))

    def preprocess_text(text):
        tokens = word_tokenize(text.lower())
        return ' '.join(token for token in tokens if token not in stop_words)

    processed_conversation = preprocess_text(senti_text_summ)
    vectorizer = CountVectorizer(stop_words='english')
    X = vectorizer.fit_transform([processed_conversation])

    lda = LatentDirichletAllocation(n_components=num_topics, random_state=42)
    lda.fit(X)

    # Aggregate all keywords from each topic
    for topic in lda.components_:
        keywords = [vectorizer.get_feature_names_out()[i] for i in topic.argsort()[:-n_top_words - 1:-1]]
        lda_topics_summ['keywords'].update(keywords)  # Add keywords to the set

    lda_topics_summ['keywords'] = list(lda_topics_summ['keywords'])  # Convert set to list before emitting
    lda_topics_summ['pin'] = session['login_pin']

    g.flag = 1
    logger.info('Summary topics generated.')
    # Emit the dictionary which now includes the pin and keywords
    socketio.emit('lda_topics_summ', lda_topics_summ)

def create_pie_chart():
    """
     Creates data for a pie chart based on the session's file processing statistics.

     Returns:
         dict: A dictionary containing labels, values, percentages, and text for the pie chart segments.
     """
    if session['total_files_list'] != 0:
        # print('pie chart value inside fuction:', session['total_files_list'], session['successful_list'],
        #       session['failed_list'], session['progress_list'])

        total_files_list = session['total_files_list']
        successful_list = session['successful_list']
        progress_list = session['progress_list']
        failed_list = session['failed_list']
        pin = session['login_pin']
    else:
        total_files_list = 1
        successful_list = 0
        progress_list = 0
        failed_list = 0
        pin = session['login_pin']

    # Calculate percentages
    labels = ['Read', 'In Progress', 'Failed']
    values = [successful_list, progress_list, failed_list]

    # Create text for each segment of the pie chart
    percentages = [(value / total_files_list) * 100 for value in values]
    text = [f"{label}: {value} ({percentage:.2f}%)" for label, value, percentage in zip(labels, values, percentages)]

    pie_chart = {"labels": labels, "values": values, "percentages": percentages, "text": text, "pin": pin}

    # pie_chart_data = json.loads(pie_chart)
    return pie_chart

def gauge_chart_auth():
    """
    Generates data for a gauge chart representing authentication success rate.

    Returns:
        dict: A dictionary containing x and y values for the gauge chart.
    """
    if 'total_success_rate' in session and 'over_all_readiness' in session:
        over_all_readiness = round(session['over_all_readiness'], 2)
        if over_all_readiness != 0:
            success_rate = round((session['total_success_rate'] / over_all_readiness) * 100, 2)
            pin = session['login_pin']
        else:
            success_rate = 0
            pin = session['login_pin']
    else:
        success_rate = 0
        over_all_readiness = 0
        pin = session['login_pin']

    # print("gauge-------->auth", success_rate, over_all_readiness)

    gauge_fig = {'x': [success_rate], 'y': [over_all_readiness], 'pin': pin}
    return gauge_fig

def log_out_forall():
    """
    Logs out the user and clears session data, including chat history, bar chart URLs, and other variables.
    """
    global chat_history_list, bar_chart_url
    global Limit_By_Size, Source_URL, tot_file
    bar_chart_url = {}
    chat_history_list = []
    Limit_By_Size = 0
    Source_URL = ""
    tot_file = 0
    summary_word_cpunt = 0
    # Check if session login pin exists
    if 'login_pin' in session:
        # Define the folder path using session login pin
        folder_name = os.path.join('static', 'login', str(session['login_pin']))

        # Define the file paths summary_chunkurl.pkl
        pickle_file_url = os.path.join(folder_name, 'summary_chunkurl.pkl')
        faiss_path_url = os.path.join(folder_name, 'faiss_index_url')
        pickle_file_path = os.path.join(folder_name, 'summary_chunk.pkl')
        pickle_faiss_path = os.path.join(folder_name, 'final_chunks.pkl')
        faiss_path = os.path.join(folder_name, 'faiss_index')
        wordcloud_image = os.path.join(folder_name, 'wordcloud.png')

        # # Remove 'final_chunks.pkl' if it exists within the session folder
        if os.path.exists(pickle_file_path):
            os.remove(pickle_file_path)

        # # Remove 'final_chunks.pkl' if it exists within the session folder
        if os.path.exists(pickle_faiss_path):
            os.remove(pickle_faiss_path)

        # # Remove 'faiss_index' directory and its contents if it exists within the session folder
        if os.path.exists(faiss_path) and os.path.isdir(faiss_path):
            shutil.rmtree(faiss_path)

        # # Remove 'final_chunks.pkl' if it exists within the session folder
        if os.path.exists(pickle_file_url):
            os.remove(pickle_file_url)

        # # Remove 'faiss_index' directory and its contents if it exists within the session folder
        if os.path.exists(faiss_path_url) and os.path.isdir(faiss_path_url):
            shutil.rmtree(faiss_path_url)

        if os.path.exists(wordcloud_image):
            os.remove(wordcloud_image)
    session.clear()

class CSVLogHandler(logging.Handler):
    def __init__(self, filename, mode='a', encoding='utf-8'):
        super().__init__()
        self.filename = filename
        self.mode = mode
        self.encoding = encoding
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        if not os.path.exists(filename):
            with open(filename, mode='w', newline='', encoding=self.encoding) as csvfile:
                writer = csv.DictWriter(csvfile,
                                        fieldnames=['timestamp', 'level', 'user_id', 'function', 'line_number', 'flag',
                                                    'message', 'exception'])
                writer.writeheader()

    def emit(self, record):
        log_entry = {
            'timestamp': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'level': record.levelname,
            'user_id': getattr(record, 'user_id', 'unknown_user'),
            'function': record.funcName,
            'line_number': record.lineno,
            'flag': getattr(record, 'flag', ''),
            'message': record.getMessage(),
            'exception': ''
        }
        if record.exc_info:
            log_entry['exception'] = self.format(record)

        with open(self.filename, self.mode, newline='', encoding=self.encoding) as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=log_entry.keys())
            writer.writerow(log_entry)

class CustomLoggerAdapter(logging.LoggerAdapter):
    def process(self, msg, kwargs):
        kwargs['extra'] = kwargs.get('extra', {})
        kwargs['extra']['user_id'] = self.extra['user_id']
        kwargs['extra']['flag'] = g.get('flag', '')
        return msg, kwargs


class CustomTimedRotatingFileHandler(TimedRotatingFileHandler):
    def __init__(self, filename, when='midnight', interval=1, backupCount=7, encoding=None, delay=False, utc=False, atTime=None):
        super().__init__(filename, when, interval, backupCount, encoding, delay, utc, atTime)
        self.csv_handler = CSVLogHandler(filename, mode='a', encoding=encoding)

    def doRollover(self):
        super().doRollover()
        # Reinitialize the CSVLogHandler to write the header in the new file
        self.csv_handler = CSVLogHandler(self.baseFilename, mode='a', encoding=self.encoding)
        # Write header to the new file
        with open(self.baseFilename, mode='w', newline='', encoding=self.encoding) as csvfile:
            writer = csv.DictWriter(csvfile,
                                    fieldnames=['timestamp', 'level', 'user_id', 'function', 'line_number', 'flag',
                                                'message', 'exception'])
            writer.writeheader()

    def emit(self, record):
        self.csv_handler.emit(record)

def setup_csv_logger(user_id):
    # log_file_name = f'logs/{user_id}/logfile_{user_id}_' + time.strftime('%Y-%m-%d_%H-%M-%S') +'.csv'
    folder_name = os.path.join('static', 'login', str(session['login_pin']))
    if not os.path.exists(folder_name):
        os.makedirs(folder_name)
    log_file_name = os.path.join(folder_name, f'logfile_{user_id}_' + time.strftime('%Y-%m-%d_%H-%M-%S') + '.csv')
    logger = logging.getLogger(f'logger_{user_id}')
    logger.setLevel(logging.INFO)

    if not any(isinstance(handler, CustomTimedRotatingFileHandler) for handler in logger.handlers):
        handler = CustomTimedRotatingFileHandler(log_file_name, when='midnight', interval=1, backupCount=7, encoding='utf-8')
        logger.addHandler(handler)
    return CustomLoggerAdapter(logger, {'user_id': user_id})


@app.route("/", methods=["GET", "POST"])
def home():
    global logger
    role_names = UserRole.query.with_entities(UserRole.name.distinct()).all()

    if request.method == "POST":
        pin = request.form.get('authpin')
        group_user = request.form.get('Grp_usr')
        engine = request.form.get('engine')
        print(group_user, pin, engine)

        role_id_mapping = {'Admin': 1, 'Guest': 2, 'ML Engine': 3}
        role_id = role_id_mapping.get(group_user)
        user_role = UserRole.query.filter_by(role_id=role_id).first()
        user = UserDetails.query.filter_by(role_id=role_id, login_pin=pin, status='Active').first()

        if role_id is not None and user_role and user:
            log_out_forall()
            session.modified = True
            session['logged_in'] = True
            session['login_pin'] = user.login_pin
            session['engine'] = engine
            session['bar_chart_ss'] = {}
            session['over_all_readiness'] = 0
            session['total_success_rate'] = 0
            session['MB'] = 0.0
            session['total_files_list'] = 0
            session['successful_list'] = 0
            session['failed_list'] = 0
            session['progress_list'] = 0
            session['lda_topics_summ'] = {}
            session['lda_topics_Q_A'] = {}
            session['senti_Positive_summ'] = 0
            session['senti_Negative_summ'] = 0
            session['senti_neutral_summ'] = 0
            session['senti_Positive_Q_A'] = 0
            session['senti_Negative_Q_A'] = 0
            session['senti_neutral_Q_A'] = 0
            session['chat_history_qa'] = []
            session['summary_add'] = []
            session['summary_word_cpunt'] = 0
            # Lists to store progress of files loading
            session['embedding_not_created'] = []
            session['failed_files'] = []
            session['progress_files'] = []

            folder_name = os.path.join('static', 'login', str(session['login_pin']))
            if not os.path.exists(folder_name):
                os.makedirs(folder_name)

            if 'login_pin' in session:
                logger = setup_csv_logger(session['login_pin'])
            else:
                g.flag = 0
                logger.error("User Session Not Found!", exc_info=True)
            # log_file_name = os.path.join(folder_name, 'logfile.csv')
            # handler = CSVLogHandler(log_file_name)
            # logger = logging.getLogger(__name__)
            # logger.setLevel(logging.INFO)
            # if logger.hasHandlers():
            #     logger.handlers.clear()
            # logger.addHandler(handler)
            logger = CustomLoggerAdapter(logger, {'user_id': session['login_pin']})

            create_or_pass_folder(container_client, session)
            folder_files = os.path.join('static', 'files', str(session['login_pin']))
            if not os.path.exists(folder_files):
                os.makedirs(folder_files)

            g.flag = 1
            logger.info(f"User {str(session['login_pin'])} logged in successfully")
            update_bar_chart_from_blob(session, blob_service_client, container_name)
            return jsonify({'redirect': url_for('data_source')})

        g.flag = 0
        logger.error(f"Invalid login attempt for Group User {group_user} with PIN {pin}",exc_info=True)
        flash('Invalid Group User or PIN Or Status Deactivate. Please try again.', 'error')
        return jsonify({'redirect': url_for('home')})

    return render_template('index.html', role_names=role_names)


# Route for logout button
@app.route('/logout')
def logout():
    # g.flag = 1
    # logger.info(f"User {str(session['login_pin'])} Logged out successfully")
    log_out_forall()

    flash('You have been successfully logged out!', 'success')
    return redirect(url_for('home'))


@app.route('/checksession')
def check_session():
    if 'login_pin' in session:
        # Session is Valid
        return jsonify({'sessionValid': True}), 200
    else:
        print("session is expired!!!")
        # Session is expired or invalid
        return jsonify({'sessionValid': False}), 401


@app.route('/data_source', methods=['GET', 'POST'])
def data_source():
    g.flag = 1
    logger.info('Accessed data_source')
    update_bar_chart_from_blob(session, blob_service_client, container_name)
    return render_template('DataSource.html')


@socketio.on('connect')
def handle_connect():
    bar_chart_data = create_bar_chart()
    gauge_source_chart_data = gauge_chart_auth()

    # socketio.emit('update_pie_chart', pie_chart_data)
    socketio.emit('update_bar_chart', bar_chart_data)
    socketio.emit('update_gauge_chart', gauge_source_chart_data)


@socketio.on('send_data')
def handle_send_data(data):
    min_date = data.get('minDate')
    max_date = data.get('maxDate')

    # Process the received data as needed
    # print(f"Received data: Min Date: {min_date}, Max Date: {max_date}")

    # Emit an event to notify clients about the new data
    emit('data_received', {
        'min_date': min_date,
        'max_date': max_date,
        'message': 'Data received successfully!'
    })


@socketio.on('update_value')
def handle_update_value(data):
    global Limit_By_Size
    Limit_By_Size = data.get('value')
    # print('Limit By Size(K/Count)', Limit_By_Size)

    # Emit an event to notify clients about the updated value
    emit('size_value_updated', {'value': Limit_By_Size, 'message': 'Value updated successfully'})


@app.route('/popup_form', methods=['POST'])
def popup_form():
    global mb_pop, file_size_bytes
    global Limit_By_Size, Source_URL
    if request.method == 'POST':
        if 'myFile' in request.files:
            # if 'myFile' in request.files or 'audio_file' in request.files:
            #     print('Not Any File Fond')
            #     return jsonify({'message': 'File not Fond'}), 400
            mb_pop = 0  # Initialize mb_pop before the loop
            files = request.files.getlist('myFile')
            if not len(files):
                return jsonify({'message': 'File not Fond'}), 400
            print('name of file is', files)
            for file in files:
                file.seek(0, os.SEEK_END)  # Move the cursor to the end of the file
                file_size_bytes = file.tell()  # Get the current cursor position, which is the file size in bytes
                file.seek(0)  # Reset the cursor back to the beginning of the file
                mb_pop += file_size_bytes / (1024 * 1024)

            mb_p = int(mb_pop)  # Move this line here
            Limit_By_Size = int(Limit_By_Size)

            # print('Limit By Size(K/Count) file size exceeds', Limit_By_Size, mb_p)
            if mb_p >= Limit_By_Size != 0:
                print('Limit By Size(K/Count) file size exceeds')
                return jsonify({'message': 'Limit By Size(K/Count) file size exceeds'}), 400
                # Convert bytes to megabytes
            session['MB'] += float("{:.2f}".format(mb_pop))
            # Calculate total number of files
            for file in files:
                upload_to_blob(file, session, blob_service_client, container_name)

        # elif request.form.get('dbURL', ''):
        #     db_url = request.form.get('dbURL', '')
        #     username = request.form.get('username', '')
        #     password = request.form.get('password', '')
        #     print('database url n all.......', db_url, username, password)
        else:
            if not request.form.get('Source_URL', ''):
                print('No Source_URL Fond')
                return jsonify({'message': 'No Source_URL Fond'}), 400
            Source_URL = request.form.get('Source_URL', '')
            print("Source_URL Fond---->", Source_URL)
        update_bar_chart_from_blob(session, blob_service_client, container_name)
        g.flag = 1
        logger.info('Data Uploaded Successfully')
        return jsonify({'message': 'Data uploaded successfully'}), 200
    else:
        g.flag = 0
        logger.error('Invalid Request Method')
        return jsonify({'message': 'Invalid request method'}), 405


@socketio.on('run_query')
def run_query(data):
    db_type = data['dbType']
    hostname = data['hostname']
    port = data['port']
    username = data['username']
    password = data['password']
    query = data['query']
    database = 'master'
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    folder_name_azure = str(session['login_pin'])
    file_name = f"query_results_{timestamp}.csv"

    try:
        if db_type == 'MySQL':
            conn = mysql.connector.connect(
                host=hostname,
                user=username,
                password=password,
                port=port
            )
            cursor = conn.cursor()
            cursor.execute(query)
            columns = [desc[0] for desc in cursor.description]
            results = cursor.fetchall()
            cursor.close()
            conn.close()

            df = pd.DataFrame(results, columns=columns)
            csv_buffer = io.StringIO()
            df.to_csv(csv_buffer, index=False)
            csv_buffer.seek(0)

            blob_name = f"{folder_name_azure}/{file_name}"
            blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
            blob_client.upload_blob(
                csv_buffer.getvalue(),
                blob_type="BlockBlob",
                content_settings=ContentSettings(content_type="text/csv"),
                overwrite=True
            )
            g.flag = 1
            logger.info('Fetched MySQL Data')
            emit('query_success', {'message': 'Data fetched and uploaded successfully.'})

        elif db_type == 'MongoDB':
            client = pymongo.MongoClient(f'mongodb://{username}:{password}@{hostname}:{port}/')
            db = client[database]
            result = db.command('eval', query)
            g.flag = 1
            logger.info('Fetched MongoDB Data')
            emit('query_success', {'message': 'Data fetched and uploaded successfully.', 'result': str(result)})

        elif db_type == 'SQLServer':
            conn_str = f'DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={hostname},{port};DATABASE=master;UID={username};PWD={password};TrustServerCertificate=yes;'
            conn = pyodbc.connect(conn_str)
            cursor = conn.cursor()
            cursor.execute(query)
            columns = [desc[0] for desc in cursor.description]
            results = cursor.fetchall()
            cursor.close()
            conn.close()

            df = pd.DataFrame(results, columns=columns)
            csv_buffer = io.StringIO()
            df.to_csv(csv_buffer, index=False)
            csv_buffer.seek(0)

            blob_name = f"{folder_name_azure}/{file_name}"
            blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
            blob_client.upload_blob(
                csv_buffer.getvalue(),
                blob_type="BlockBlob",
                content_settings=ContentSettings(content_type="text/csv"),
                overwrite=True
            )
            g.flag = 1
            logger.info('Fetched SQL Server Data')
            emit('query_success', {'message': 'Data fetched and uploaded successfully.'})

        else:
            g.flag = 0
            logger.error('Unsupported database type or Conection error.')
            emit('query_error', {'error': 'Unsupported database type or Connection error'})

    except Exception as e:
        import traceback
        g.flag = 0
        logger.error('Unsupported database type', exc_info=True)
        emit('query_error', {'error': str(e), 'trace': traceback.format_exc()})


@app.route('/Cogni_button', methods=['GET'])
def Cogni_button():

    try:
        start_time = time.time()
        g.flag = 1
        logger.info('CogniLink load button pressed')
        response = update_when_file_delete()

        elapsed_time = time.time() - start_time
        g.flag = 1
        logger.info(f"Load Data Function executed in {elapsed_time} seconds")
        socketio.emit('button_response', {'message': 'Data loaded successfully', 'pin': session['login_pin']})
        return response
    except Exception as e:
        g.flag = 0
        logger.error("Unhandled exception occurred", exc_info=True)
        socketio.emit('button_response', {'message': str(e), 'pin': session['login_pin']})
        return jsonify({'message': str(e)}), 500


@app.route("/Summary", methods=['GET', 'POST'])
def summary():
    session['summary_word_cpunt'] = 0
    g.flag = 1
    logger.info("Summary page accessed.")
    return render_template('summary.html')


@socketio.on('summary_input')
def handle_summary_input(data):
    global text_word_cloud
    session['summary_add'] = []
    start_time = time.time()

    try:
        folder_name = os.path.join('static', 'login', str(session['login_pin']))

        pickle_file_path = os.path.join(folder_name, 'summary_chunk.pkl')
        with open(pickle_file_path, 'rb') as f:
            all_summary = pickle.load(f)

        custom_p = data.get('summary_que')
        session['summary_word_cpunt'] = data['value']
        # print("summary_word_cpunt_input_function--->", summary_word_cpunt)
        print(f"summary_word_cpunt_input_function---> {session['login_pin']} --> {session['summary_word_cpunt']}")

        # if session.get('summary_word_cpunt', 0) == 0:
        if int(session['summary_word_cpunt']) == 0:
            emit('summary_response', {'message': 'summary word count is zero'})
            return
        else:
            custom_p = custom_p + ' and summary in ' + str(session['summary_word_cpunt']) + ' word'

        summ = []
        counter = 1

        flattened_entries = [(filename, document) for entry in all_summary for filename, documents_list in entry.items()
                             for document in documents_list]

        for filename, document in flattened_entries:
            summary = custom_summary(document, custom_p, chain_type)
            key = f'{filename}--{counter}--'
            summary_dict = {'key': key, 'value': summary}
            summ.append(summary_dict)
            counter += 1

        senti_text_summ = ' '.join(entry['value'] for entry in summ)
        analyze_sentiment_summ(senti_text_summ)

        generate_word_cloud(senti_text_summ)
        perform_lda____summ(senti_text_summ)
        session['summary_add'].extend(summ)

        elapsed_time = time.time() - start_time
        g.flag = 1
        logger.info(f'Summary Generated in {elapsed_time} seconds')
        emit('summary_response', session['summary_add'][::-1])
    except Exception as e:
        g.flag = 0
        logger.error('Summary generation error', exc_info=True)
        print('Exception of summary_input:', str(e))
        emit('summary_response', {'message': 'No data Load'})


@socketio.on('clear_chat_summ')
def handle_clear_chat_summ(data):
    global text_word_cloud
    try:
        if 'login_pin' in session:
            folder_name = os.path.join('static', 'login', str(session['login_pin']))
            wordcloud_image = os.path.join(folder_name, 'wordcloud.png')
            if os.path.exists(wordcloud_image):
                os.remove(wordcloud_image)
        lda_topics_summ = {'pin':session['login_pin'],'keywords':[]}
        socketio.emit('lda_topics_summ', lda_topics_summ)
        senti = {'pin':session['login_pin']}
        socketio.emit('analyze_sentiment_summ', senti)

        text_word_cloud = ''
        session['summary_word_cpunt'] = 0
        session['lda_topics_summ'] = {}
        session['senti_Positive_summ'] = 0
        session['senti_Negative_summ'] = 0
        session['senti_neutral_summ'] = 0
        session['summary_add'] = []

        g.flag = 1  # Set flag to 1 on success
        logger.info(f"Summary chat cleared")
        emit('clear_chat_response', {'message': 'Summary cleared successfully'})
    except Exception as e:
        g.flag = 0
        logger.info(f"Summary chat not cleared. ERROR!", exc_info=True)
        print('error in Cleared Chat', str(e))
        emit('clear_chat_response', {'message': str(e)})


@app.route('/CogniLink_Services_QA', methods=['GET', 'POST'])
def ask():
    g.flag = 1
    logger.info("Ask CogniLink page accessed.")
    return render_template('ask.html')


@socketio.on('ask_question')
def handle_ask_question(data):
    global senti_text_Q_A
    start_time = time.time()

    try:
        question = data['question']

        index_name = str(session['login_pin'])
        # faiss_index_path = os.path.join(folder_name, 'faiss_index')
        vector_store: AzureSearch = AzureSearch(
            azure_search_endpoint=vector_store_address,
            azure_search_key=vector_store_password,
            index_name=index_name,
            embedding_function=embeddings.embed_query)

        # Update progress to 25%
        emit('progress', {'percentage': 25})

        # new_db = FAISS.load_local(faiss_index_path, embeddings, allow_dangerous_deserialization=True)
        conversation = get_conversation_chain(vector_store)
        response = conversation({"question": question})
        
        # Update progress to 50%
        emit('progress', {'percentage': 50})
        time.sleep(0.5)

        doc_source = [response["source_documents"][0].metadata["source"]]
        doc_page_num = [response["source_documents"][0].metadata.get("page", 0) + 1]

        final_chat_hist = [(response['chat_history'][i].content if response['chat_history'][i] else "",
                            response['chat_history'][i + 1].content if response['chat_history'][i + 1] else "",
                            doc_source[i], doc_page_num[i])
                           for i in range(0, len(response['chat_history']), 2)]

        chat_history_list = [{"question": chat_pair[0],
                              "answer": chat_pair[1],
                              "source": chat_pair[2],
                              "page_number": chat_pair[3]}
                             for chat_pair in final_chat_hist]

        senti_text_Q_A = ' '.join(entry['answer'] for entry in chat_history_list)
        
        # Update progress to 75%
        emit('progress', {'percentage': 75})
        time.sleep(0.5)

        analyze_sentiment_Q_A(senti_text_Q_A)
        perform_lda___Q_A(senti_text_Q_A)
        session['chat_history_qa'].extend(chat_history_list)

        # Update progress to 100%
        emit('progress', {'percentage': 100})

        elapsed_time = time.time() - start_time
        g.flag = 1
        logger.info(f'Answer Generated in {elapsed_time} seconds')

        emit('response', {'chat_history': session['chat_history_qa'][::-1]})
    except Exception as e:
        g.flag = 0
        logger.error('Ask CogniLink answer generation error', exc_info=True)
        print("Exception of ask_question:", str(e))
        emit('response', {'message': 'No data Load'})


@socketio.on('clear_chat')
def handle_clear_chat():
    try:
        # sentiment variable for Q_A
        session['lda_topics_Q_A'] = {}
        session['senti_Positive_Q_A'] = 0
        session['senti_Negative_Q_A'] = 0
        session['senti_neutral_Q_A'] = 0
        session['chat_history_qa'] = []
        senti_Q_A = {'pin':session['login_pin']}
        socketio.emit('analyze_sentiment_Q_A', senti_Q_A)
        lda_topics_Q_A = {'pin':session['login_pin'], 'keywords':[]}
        socketio.emit('lda_topics_QA', lda_topics_Q_A)
        g.flag = 1  # Set flag to 1 on success
        logger.info(f"clear_chat for ask_question route")
        emit('chat_cleared', {'message': 'Chat history cleared successfully'})
    except Exception as e:
        g.flag = 0  # Set flag to 0 on failure
        logger.error(f"clear_chat for ask_question route error", exc_info=True)
        emit('chat_cleared', {'message': str(e)})


@app.route("/delete", methods=["DELETE"])
def delete_files():
    try:
        data = request.get_json()
        file_names = data.get('file_names', [])

        if not file_names:
            return jsonify({'message': 'No files specified for deletion'}), 400

        folder_name = session.get('login_pin')  # Make sure 'login_pin' is set in the session
        deleted_files = []

        for file_name in file_names:
            blobs = container_client.list_blobs(name_starts_with=folder_name)

            # Find the blob with the matching file name
            target_blob = next((blob for blob in blobs if blob.name.split('/')[-1] == file_name), None)
            if target_blob:
                blob_client = container_client.get_blob_client(target_blob.name)
                blob_client.delete_blob()
                deleted_files.append(file_name)
                socketio.emit('delete_selected_file_response', {'message': 'Successfully File Deleted'})

            else:
                g.flag = 0
                logger.error(f"delete for delete route: {file_name} not found", exc_info=True)
                return jsonify({'error': f'File {file_name} not found'}), 404
        update_when_file_delete()
        update_bar_chart_from_blob(session, blob_service_client, container_name)
        g.flag = 1  # Set flag to 1 on success
        logger.info(f"Selected vault files deleted successfully")
        return jsonify({'message': f'Files {deleted_files} deleted successfully'})
    except Exception as e:
        g.flag = 0  # Set flag to 0 on error
        logger.error(f"delete for delete route error", exc_info=True)
        return jsonify({'error': str(e)}), 500


@app.route("/table_update", methods=['GET'])
def get_data_source():
    try:
        folder_name = session.get('login_pin')  # Make sure 'login_pin' is set in the session
        blobs = container_client.list_blobs(name_starts_with=folder_name)

        # Fetch lists from session
        progress_files = session.get('progress_files', [])
        failed_files = session.get('failed_files', [])
        embedding_not_created = session.get('embedding_not_created', [])

        # Construct the data with status based on lists
        data = []
        for blob in blobs:
            file_name = blob.name.split('/')[1]
            if file_name in progress_files:
                status = 'U | EC'
            elif file_name in failed_files:
                status = 'U | F'
            elif file_name in embedding_not_created:
                status = 'U | ENC'
            else:
                status = 'U | ENC'
            data.append({
                'name': file_name,
                'url': f"https://{blob_service_client.account_name}.blob.core.windows.net/{container_name}/{blob.name}",
                'status': status
            })

        g.flag = 1  # Set flag to 1 on success
        logger.info(f"table_update route successfully send data")
        # Emit the data to the socket channel 'updateTable'
        socketio.emit('updateTable', data)

        return jsonify(data)
    except Exception as e:
        g.flag = 0  # Set flag to 1 on success
        logger.error(f"table_update route error", exc_info=True)
        print(f"Exceptions is{e}")
        return jsonify({'error': str(e)}), 500


@socketio.on('webcrawler_start')
def webcrawler_start(data):
    url = data['url']
    login_pin = data['login_pin']
    session['login_pin'] = login_pin  # Store the login_pin in session

    # Create a unique folder for each user's downloaded files
    folder_name = os.path.join('static', 'files', str(login_pin))
    os.makedirs(folder_name, exist_ok=True)

    try:
        print("Received URL:", url)
        session['current_status'] = "Website URL Received"
        socketio.emit('update_status', {'status': session['current_status'], 'pin': login_pin})

        response = requests.get(url)
        pdf_info_list = extract_pdf_info_from_table(response.content)

        total_files = len(pdf_info_list)
        session['files_downloaded'] = 0
        session['progress_percentage'] = 0

        session['current_status'] = "Crawling in progress..."
        socketio.emit('update_status', {'status': session['current_status'], 'pin': login_pin})

        for pdf_name, pdf_link in pdf_info_list:
            try:
                pdf_url = pdf_link
                name = pdf_name.replace('/', '-')
                if not name:
                    name = os.path.basename(urlparse(pdf_url).path)
                download_pdf(pdf_url, folder_name, name)

                session['files_downloaded'] += 1
                session['progress_percentage'] = int(session['files_downloaded'] / total_files * 100)
                current_file = name
                socketio.emit('update_progress', {
                    'current_status': session['current_status'],
                    'total_files': total_files,
                    'files_downloaded': session['files_downloaded'],
                    'progress_percentage': session['progress_percentage'],
                    'current_file': current_file,
                    'pin': login_pin
                })
            except Exception as e:
                print(f"Error occurred: {e}")

        session['current_status'] = "File downloaded successfully"
        socketio.emit('update_progress', {
            'current_status': session['current_status'],
            'total_files': total_files,
            'files_downloaded': session['files_downloaded'],
            'progress_percentage': session['progress_percentage'],
            'current_file': current_file,
            'pin': login_pin
        })
        g.flag = 1
        logger.info("Web Crawling done successfully")
        socketio.emit('update_status', {'status': session['current_status'], 'pin': login_pin})
        return jsonify({'message': 'All files downloaded successfully'})
    except Exception as e:
        session['current_status'] = "Error occurred"
        socketio.emit('update_status', {'status': session['current_status'], 'pin': login_pin})
        g.flag = 0
        logger.error("Web crawling error", exc_info=True)
        print("Exception of web crawling:", str(e))
        return jsonify({'message': 'URL Not found'})


def extract_pdf_info_from_table(html_content):
    """
    Extracts PDF information from an HTML table.

    Args:
        html_content (str): HTML content containing the table.

    Returns:
        list: A list of tuples containing PDF name and link.
    """
    # Parse the HTML content
    soup = BeautifulSoup(html_content, 'html.parser')

    # Find all table rows
    rows = soup.find_all('tr')

    pdf_info_list = []

    # Iterate over each row
    for row in rows:
        # Extract data from each row
        cells = row.find_all('td')
        if len(cells) >= 2:
            pdf_name = cells[0].text.strip()
            pdf_link = cells[1].find('a')['href']
            pdf_info_list.append((pdf_name, pdf_link))

    return pdf_info_list


def download_pdf(url, folder_name, filename):
    """
    Downloads a PDF file from a given URL and saves it to a specified folder with a given filename.

    Args:
        url (str): The URL from which to download the PDF.
        folder_name (str): The name of the folder to save the downloaded PDF.
        filename (str): The name to give the downloaded PDF file (without the .pdf extension).

    Returns:
        None

    Side Effects:
        Updates the global variable `current_file` to the name of the file being downloaded.
        Logs the download progress and success.
    """
    global current_file

    response = requests.get(url)
    file_path = os.path.join(folder_name, filename + '.pdf')

    print(f"Downloading: {filename} from {url} to {file_path}")
    current_file = filename  # Update current file being downloaded

    with open(file_path, 'wb') as f:
        f.write(response.content)
    g.flag = 1
    logger.info(f"Route download_progress success")
    print(f"Downloaded: {filename}")


@socketio.on('fetch_pdf_files')
def handle_fetch_pdf_files():
    directory_path = "static/files/" + session.get('login_pin', '')
    pdf_files = [file for file in os.listdir(directory_path) if file.endswith(".pdf")]
    emit('pdf_files', {"pdf_files": pdf_files})


# This function should contain your file deletion logic
def delete_file(directory_path, file_name):
    """
    Deletes a specified file from a given directory.

    Args:
        directory_path (str): The path to the directory containing the file.
        file_name (str): The name of the file to be deleted.

    Returns:
        bool: True if the file was successfully deleted, False otherwise.

    Side Effects:
        Sets the global variable `g.flag` to 1 on success and 0 on failure.
        Logs the success or failure of the file deletion process.
    """
    try:
        file_path = os.path.join(directory_path, file_name)
        if os.path.exists(file_path):
            os.remove(file_path)
            g.flag = 1  # Set flag to 1 on success1
            logger.info(f"Function delete_file success")
            return True
        else:
            g.flag = 0
            logger.error(f"Function delete_file error File does not exist", exc_info=True)
            print("File does not exist:", file_path)
            return False
    except Exception as e:
        g.flag = 0  # Set flag to 1 on success1
        logger.error(f"Function delete_file error", exc_info=True)
        print("Error occurred while deleting file:", str(e))
        return False


@socketio.on('delete_pdf_file')
def delete_pdf_file(data):
    try:
        folder_name_azure = str(data['login_pin'])
        file_name = data['fileName']
        login_pin = data['login_pin']

        if login_pin is None:
            return jsonify({'message': 'User session not found'}), 400

        if data.get('deletePopup') == 'deletepopupn3':
            directory_path = "static/files/" + login_pin
            res = delete_file(directory_path, file_name)
            # Delete the file
            if res is True:
                print("file deleted")
                socketio.emit('delete_response', {'message': 'Successfully File Deleted'})
            else:
                socketio.emit('delete_response', {'message': 'Failed To Delete'})
        else:
            # Assuming you have the folder name for Azure stored in `folder_name_azure`
            blob_name = f"{folder_name_azure}/{file_name}"
            blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)

            file_path = os.path.join("static/files", login_pin, file_name)
            with open(file_path, "rb") as file:
                file_content = file.read()

            # Upload the content to Azure Blob Storage, overwriting the existing blob if it exists
            blob_client.upload_blob(file_content, blob_type="BlockBlob",
                                    content_settings=ContentSettings(content_type="application/pdf"),
                                    overwrite=True)
            directory_path = "static/files/" + login_pin

            res = delete_file(directory_path, file_name)

        # Delete the file
        if res is True:
            print("file deleted")
            g.flag = 1  # Set flag to 1 on success1
            logger.info(f"Successfully webcrawler File Loaded In Cognilink Application ")
            socketio.emit('delete_response', {'message': 'Successfully File Loaded In Cognilink Application'})
        else:
            g.flag = 0
            logger.error(f"Failed To Loaded In Cognilink Application", exc_info=True)
            socketio.emit('delete_response', {'message': 'Failed To Loaded In Cognilink Application'})
    except Exception as e:
        g.flag = 0  # Set flag to 1 on success1
        logger.error(f"Error in webcrawler File Loaded In Cognilink Application --select_pdf_file route error is::{e}", exc_info=True)
        socketio.emit('delete_response', {'message': 'Error occurred while deleting file: {}'.format(str(e))}), 500


@socketio.on('eda_process')
def handle_eda_process(data):
    global df, png_file
    img_base64 = None
    folder_name = str(session.get('login_pin', 'default'))
    try:
        file_url = data.get('fileUrl')
        if file_url:
            g.flag = 1
            logger.info("SocketIO Eda_Process File name received")
            blob_list_eda = blob_service_client.get_container_client(container_name).list_blobs(
                name_starts_with=folder_name)
            for blob in blob_list_eda:
                if blob.name in file_url:
                    blob_client = container_client.get_blob_client(blob)
                    blob_data = blob_client.download_blob().readall()
                    data_stream = BytesIO(blob_data)

                    if file_url.endswith('.xlsx') or file_url.endswith('.xls'):
                        df = pd.read_excel(data_stream)
                    elif file_url.endswith('.csv'):
                        df = pd.read_csv(data_stream)
                    else:
                        emit('eda_response', {'message': 'Unsupported file format', 'success': False})
                        return

                    g.flag = 1
                    logger.info("SocketIO Eda_Process Data Loaded Successfully.")
                    emit('eda_response', {'message': 'Data Loaded Successfully. Ask Virtual Analyst!', 'success': True})
                    return

        question = data.get('question')
        print("question----->", question)
        if question:
            g.flag = 1
            logger.info("SocketIO Eda_Process Question received.")
            llm = AzureOpenAI(
                deployment_name="gpt-4-0125-preview",
                api_key=main_key,
                azure_endpoint="https://ea-openai.openai.azure.com/",
                api_version="2023-05-15"
            )

            agent = Agent(df, config={
                "llm": llm,
                "save_charts": True,
                "save_logs": False,
                "enable_cache": False,
                "save_charts_path": 'static/files/image',
                "open_charts": False,
                "max_retries": 1
            })

            output = agent.chat(question)
            g.flag = 1
            logger.info("SocketIO Eda_Process output received.")

            if isinstance(output, pd.DataFrame):
                output_json = output.to_json(orient='records')
                output_type = 'table'
            elif isinstance(output, (int, float)):
                output_json = json.dumps(output)
                output_type = 'numeric'
            elif isinstance(output, str):
                output_json = json.dumps(output)
                output_type = 'text'
            else:
                output_json = json.dumps(str(output))
                output_type = 'unknown'

            image_path = 'static/files/image/'
            png_file = None

            if os.path.exists(image_path):
                for file_name in os.listdir(image_path):
                    if file_name.endswith('.png'):
                        png_file = os.path.join(image_path, file_name)
                        break

            if png_file:
                with open(png_file, "rb") as img_file:
                    img_data = img_file.read()
                    img_base64 = base64.b64encode(img_data).decode('utf-8')
                output_json = json.dumps(question)
                output_type = 'text'
                os.remove(png_file)

            response = {
                'success': True,
                'message': 'Question Processed Successfully!',
                'output_any': output_json,
                'output_type': output_type,
                'image': img_base64
            }
            g.flag = 1
            logger.info("SocketIO Eda_Process response emitted.")
            emit('eda_response', response)
        else:
            g.flag = 0
            logger.info('No Question Provided!')
            emit('eda_response', {'success': False, 'message': 'No Question Provided!'})
    except Exception as e:
        g.flag = 0
        logger.error(f"Error in Eda_Process: {e}",exc_info=True)
        emit('eda_response', {'message': f'Error occurred while EDA process: {str(e)}', 'success': False})


@app.route('/blank')
def blank():
    return render_template('blank.html')


@app.route('/EDA', methods=['GET', 'POST'])
def eda_analysis():
    g.flag = 1
    logger.info("Virtual analyst page accessed.")
    return render_template('EDA.html')


@app.route('/signup')
def signup():
    return render_template('signup.html')


@app.route('/file_manager')
def file_manager():
    g.flag = 1
    logger.info("Webcrawl file manager accessed.")
    return render_template('webCrawl_file_manager.html')


@app.route('/_404')
def _404():
    return render_template('_404.html')


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, debug=True)
