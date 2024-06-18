import streamlit as st
import pandas as pd
from pandasai.llm import AzureOpenAI
from pandasai import Agent
from dotenv import load_dotenv

import os


llm = AzureOpenAI(
    api_token=os.getenv("AZURE_OPENAI_API_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_version="2023-05-15",
    deployment_name="gpt-4-0125-preview"
)
st.title("Data Analysis with PandasAI Agent uisng Azure models ")
uploaded_file=st.sidebar.file_uploader("Upload a CSV file",type=["csv","xlsx"])
if uploaded_file is not None:
    if uploaded_file.type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            # Excel file
            df = pd.read_excel(uploaded_file)
            st.write(df.head(3))

    else:
            # CSV file
            df = pd.read_csv(uploaded_file)
            st.write(df.head(3))


    agent=Agent(df,config={"llm":llm,"enable_cache": False,"save_charts":True})
    prompt=st.text_input("Enter yur prompt")

    if st.button("Generate"):
        if prompt:
            with st.spinner("Generating response..."):
                st.write(agent.chat(prompt))