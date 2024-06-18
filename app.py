import streamlit as st
import tempfile
import os
from dotenv import load_dotenv
from PyPDF2 import PdfReader
#from langchain.llms import AzureOpenAI
from langchain.chat_models import AzureChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains.summarize import load_summarize_chain
from langchain.document_loaders import PyPDFLoader, Docx2txtLoader, UnstructuredExcelLoader, CSVLoader, UnstructuredWordDocumentLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings import AzureOpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chat_models import AzureChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain, RetrievalQA
from htmlTemplates import css, bot_template, user_template


from langchain.agents import create_sql_agent
from langchain.agents.agent_toolkits import SQLDatabaseToolkit
from langchain.sql_database import SQLDatabase
from langchain.agents import AgentExecutor
from langchain.chains import create_sql_query_chain
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient





# for default Azure account use only
openapi_key = "OPENAI-API-KEY"
KVUri = f"https://eavault.vault.azure.net/"
credential = DefaultAzureCredential()
client = SecretClient(vault_url=KVUri, credential=credential)
retrieved_secret = client.get_secret(openapi_key)
main_key = retrieved_secret.value


os.environ["OPENAI_API_TYPE"] = "azure"
# os.environ["OPENAI_API_BASE"] = "https://ea-openai.openai.azure.com/"
os.environ["AZURE_OPENAI_ENDPOINT"] = "https://ea-openai.openai.azure.com/"
# os.environ["OPENAI_API_KEY"] = "2355a247f79f4b8ea2adaa0929cd32c2"
os.environ["OPENAI_API_KEY"] = main_key
os.environ["OPENAI_API_VERSION"] = "2023-05-15"

llm=AzureChatOpenAI(azure_deployment="gpt-35-turbo", model_name="gpt-4",temperature=0.50)
embeddings = AzureOpenAIEmbeddings(azure_deployment='text-embedding')
chunk_size = 8000
chunk_overlap = 400
custom_prompt = ''
chain_type = 'map_reduce'
num_summaries = 1

text_spliter = RecursiveCharacterTextSplitter(chunk_size=8000,
                                              chunk_overlap=400,
                                              length_function=len)

def custom_summary(docs, llm, custom_prompt, chain_type, num_summaries):
    custom_prompt = custom_prompt + """:\n {text}"""
    COMBINE_PROMPT = PromptTemplate(template=custom_prompt, input_variables = ["text"])
    MAP_PROMPT = PromptTemplate(template="Summarize:\n{text}", input_variables=["text"])
    if chain_type == "map_reduce":
        chain = load_summarize_chain(llm,chain_type=chain_type,
                                     map_prompt=MAP_PROMPT,
                                     combine_prompt=COMBINE_PROMPT)
    else:
        chain = load_summarize_chain(llm,chain_type=chain_type)
    
    summaries = chain({"input_documents": docs}, return_only_outputs=True)["output_text"]
    #summaries = []
    # for i in range(num_summaries):
    #     summary_output = chain({"input_documents": docs}, return_only_outputs=True)["output_text"]
    #     summaries.append(summary_output)
    print(summaries)
    return summaries

def summarize_pdf(pdf_folder, user_prompt):
    summarices = []
    file_names = []
    custom_prompt = user_prompt
    for file_obj in pdf_folder:
        file_names.append(file_obj.name)
        doc = get_chunks(file_obj)
        summary = custom_summary(doc, llm, custom_prompt, chain_type, num_summaries)
        summarices.append(summary)
    
    return summarices, file_names


### Start question/answer section
def get_chunks(file_obj):
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        temp_path = temp_file.name
        temp_file.write(file_obj.read())
    
    if '.pdf' in file_obj.name: 
        loader = PyPDFLoader(temp_path)
    elif '.docx' in file_obj.name or '.doc' in file_obj.name:
        loader = Docx2txtLoader(temp_path)
    elif '.xlsx' in file_obj.name or '.xls' in file_obj.name:
        loader = UnstructuredExcelLoader(temp_path)

    chunks = loader.load_and_split(text_spliter)
    print(f"Number of chuncks :: {len(chunks)}")
    return chunks

def get_pdf_text(pdf_docs):
    text = ""
    for pdf in pdf_docs:
        pdf_reader = PdfReader(pdf)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

def get_text_chunks(row_text):
    text_spliter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )

    chunks = text_spliter.split_text(row_text)
    print(f"No. of chunks: {len(chunks)}")
    return chunks

def str_evaluator(source_doc):
    from langchain.evaluation import load_evaluator
    score = []
    evaluator = load_evaluator("embedding_distance", embeddings=embeddings)
    for docs in source_doc:
        score.append(evaluator.evaluate_strings(prediction=source_doc['result'], reference=docs))

    print(score)

def get_vectostore(text_chunks):
    # vectorstore = []
    # db1 = FAISS.from_texts(["test"], embedding=embeddings)
    # for ele in text_chunks:
    #     #print(ele)
    #     print(FAISS.from_documents([ele], embedding=embeddings))
    #     vectorstore.append(FAISS.from_documents([ele], embedding=embeddings))
    #     db1.merge_from(FAISS.from_documents([ele], embedding=embeddings))
    #vectorstore=FAISS.from_texts(text_chunks, embedding=embeddings)
    vectorstore=FAISS.from_documents(text_chunks, embedding=embeddings)
    #final_db = db1.merge_from(vectorstore)
    return vectorstore

def get_conversation_chain(vectorstore):
    llm=AzureChatOpenAI(azure_deployment="gpt-35-turbo")

    template = """Use the following pieces of context to answer the question at the end. If you don't know the answer, 
    just say that you don't know, don't try to make up an answer. Use three sentences maximum. Keep the answer as concise as possible. 
    {context}
    Question: {question}
    Helpful Answer:"""
    CUSTOM_QUESTION_PROMPT = PromptTemplate(input_variables=["context", "question"], template=template)
    # qa_chain = ConversationalRetrievalChain.from_llm(llm=llm, 
    #                                                 retriever=vectorstore.as_retriever(),
    #                                                 verbose=False,
    #                                                 return_source_documents=True,
    #                                                 combine_docs_chain_kwargs={"prompt": CUSTOM_QUESTION_PROMPT})

    #response = qa_chain({"question": 'date of birth of raja', "chat_history": chat_history})
    memory = ConversationBufferMemory(memory_key="chat_history", input_key='question', return_messages=True, output_key="answer")
    QA_CHAIN_PROMPT = PromptTemplate.from_template(template)  
    # Run chain from_llm
    #qa_chain = RetrievalQA.from_chain_type(
    # qa_chain = RetrievalQA.from_llm(
    #     llm,
    #     retriever=vectorstore.as_retriever(),
    #     memory=memory,
    #     return_source_documents=True
    # )

    #return qa_chain
    # memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    conversation_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectorstore.as_retriever(),
        memory=memory,
        return_source_documents=True,
        combine_docs_chain_kwargs={"prompt": CUSTOM_QUESTION_PROMPT}
    )
    print(f"Conversation chain is \n {conversation_chain}")
    return conversation_chain
doc_source = []
doc_page_num = []
def handel_userinput(user_question):
    response = st.session_state.conversation({"question": user_question})
    # st.write(response)
    all_source = [(ele.metadata["source"],ele.metadata.get("page", 0))  for ele in response["source_documents"]]
    # print(all_source)
    st.session_state.doc_source.append(response["source_documents"][0].metadata["source"])
    st.session_state.doc_page_num.append(response["source_documents"][0].metadata.get("page", 0)+1)
    print(st.session_state.doc_page_num)
    print(st.session_state.doc_source)
    final_chat_hist = []
    for i in range(len(response['chat_history'])//2):
        j = i*2
        lis_obj = response['chat_history'][j :j+2]
        lis_obj.append(st.session_state.doc_source[i])
        lis_obj.append(st.session_state.doc_page_num[i])
        final_chat_hist.append(lis_obj)
    #print(final_chat_hist)
    st.session_state.chat_history = response['chat_history']
    for ele in final_chat_hist[::-1]:
        st.write(user_template.replace("{{MSG}}", ele[0].content), unsafe_allow_html=True)
        st.write(bot_template.replace("{{MSG}}", ele[1].content).replace("{{source_url}}", ele[2]).replace("{{page_number}}", str(ele[3])), unsafe_allow_html=True)

    #st.write(st.session_state.chat_history)
    # for i, message in enumerate(st.session_state.chat_history):
    #     if i%2==0:
    #         st.write(user_template.replace("{{MSG}}", message.content), unsafe_allow_html=True)
    #     else:
    #         st.write(bot_template.replace("{{MSG}}", message.content).replace("{{source_url}}", doc_source[i-1*i]).replace("{{page_number}}", str(doc_page_num[i-1])), unsafe_allow_html=True)
### End question/answer section
db_user = "extremumadmin"
db_password = "Welcome!#34"
db_host = "extremum-mysql-db.mysql.database.azure.com"
db_name = "extremum-db"
conn_string = f"mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}"

def question_answer_on_structure_data(conn_string, query_input=None):

    try:
        db = SQLDatabase.from_uri(conn_string)
    except Exception as ex:
        print(ex)
        return "Database connection issue."
    
    try:

        llm = AzureChatOpenAI(azure_deployment="gpt-35-turbo", model_name="gpt-4", temperature=0.50)

        toolkit =  SQLDatabaseToolkit(db=db, llm=llm,)
        agent_executor = create_sql_agent(
            llm=llm,
            toolkit=toolkit,
            # verbose=False,
            agent_executor_kwargs = {"return_intermediate_steps": True}
        )

        response = agent_executor.invoke(query_input)
        print(response['output'])
        queries = []
        for (log, output) in response["intermediate_steps"]:
            if log.tool == 'sql_db_query':
                queries.append(log.tool_input)
        print(queries)
        return response['output'], queries[-1]
    except Exception as ex:
        print(ex)


def main():
    #st.title("Select the option to perform the Question/Answer or Summarization")
    st.sidebar.header("Response Type")
    choice = st.sidebar.selectbox("", ["Question/Answer", "Summarization", "Question/Answer with Database"])
    if choice =='Question/Answer with Database':
        user_question = st.text_input("Ask a  question about your documents:")
        if user_question:
            output, query = question_answer_on_structure_data(conn_string, user_question)
            st.write(f"output:  {output}:")
            st.write(f"SQL query:   {query}")

    elif choice == 'Summarization':
        st.header("CogniLink Response Board")
        user_prompt = st.text_input("Enter the custom summary prompt")
        pdf_files = st.file_uploader("Upload files:", type=['docx', 'doc', 'pdf', 'xlsx', 'xls'], accept_multiple_files=True)
        if pdf_files:
            if st.button("Generate Summary"):
                st.write("Summaries:")
                Summaries, file_names = summarize_pdf(pdf_files, user_prompt)
                for i, summary in enumerate(Summaries):
                    st.write(f"Surmmary of {file_names[i]}:")
                    st.write(summary)

    elif choice == 'Question/Answer':
        st.header("CogniLink Response Board")
        st.write(css, unsafe_allow_html=True)
        if "doc_source" not in st.session_state:
            st.session_state.doc_source=[]
            st.session_state.doc_page_num = []
        if "conversation"  not in st.session_state:
            st.session_state.conversation=None
        if "chat_history"  not in st.session_state:
            st.session_state.chat_history  = None
        user_question = st.text_input("Ask a  question about your documents:")
        if user_question:
            handel_userinput(user_question)

        with st.sidebar:
            #st.subheader("Your documents")
            finlal_chunks = []
            docs = st.file_uploader("Upload your files here and click on Process", type=['docx', 'doc', 'pdf', 'xlsx', 'xls'], accept_multiple_files=True)
            if st.button("Process"):
                with st.spinner("Processing"):
                    # get pdf text
                    #row_text = get_pdf_text(pdf_docs)
                    # get the text chunks
                    #text_chunks = get_text_chunks(row_text)
                    for f_obj in docs:
                        chunks = get_chunks(f_obj)
                        finlal_chunks.extend(chunks)
                    # create vextorstore
                    vectorstore= get_vectostore(finlal_chunks)
                    # create conversation chain
                    st.session_state.conversation = get_conversation_chain(vectorstore)
            if len(finlal_chunks)>0:
                st.subheader("Processing complete. Ready!")

    

if __name__ == '__main__':
    main()