import streamlit as st
import pandas as pd
from pandasai.llm import AzureOpenAI
from pandasai import Agent
from dotenv import load_dotenv
import os



def chat_with_csv(input_csvs,prompt):
    llm = AzureOpenAI(
    api_token=os.getenv("AZURE_OPENAI_API_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_version="2023-05-15",
    deployment_name="gpt-4-0125-preview"
)
    agent=Agent(data,config={"llm":llm,"save_charts":True,"open_charts":False})
    result=agent.chat(prompt)
    return result
st.set_page_config(layout='wide')
st.title("Data Analysis with PandasAI Agent uisng Azure models ")

# upload multiple CSV files
input_csvs=st.file_uploader("Upload your CSV files",type=["csv"],accept_multiple_files=True)

if input_csvs:
    selected_file=st.selectbox("Select a csv file",[file.name for file in input_csvs])
    selected_index=[file.name for file in input_csvs].index(selected_file)
    #dfs=[pd.read_csv(file) for file in input_csvs]
    #joined_df=pd.concat(dfs,axis=0)

    #load and display selected csv file
    st.info("CSV file uploaded Successfully!!")
    data=pd.read_csv(input_csvs[selected_index])
    st.dataframe(data,use_container_width=True)

    #Prompt
    st.info("Chat Below:")
    input_text=st.text_area("Enter your query")

    #Perform Analysis
    sumbmit=st.button("Chat with CSV")
    if sumbmit:
        st.info("Your Query : "+ input_text)
        result= chat_with_csv(data,input_text)
        st.success(result)
