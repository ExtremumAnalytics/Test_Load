import os
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from azure.storage.blob import BlobServiceClient
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from msrest.authentication import CognitiveServicesCredentials
from langchain.embeddings import AzureOpenAIEmbeddings
from dotenv import load_dotenv

# Load environment variables from .env file for local development
load_dotenv()

# Check if running in production or development environment
IS_PRODUCTION = os.getenv('IS_PRODUCTION', 'false').lower() == 'true'
print(f"IS_PRODUCTION: {IS_PRODUCTION}")

if not IS_PRODUCTION:
    print("Running in production mode.")
    # For default Azure account use only
    vectorsecret = "vectordatabsekey"
    computer_vision = "computer-vision-key-v1"
    openapi_key = "OPENAI-API-KEY"
    KVUri = f"https://eavault.vault.azure.net/"
    credential = DefaultAzureCredential()
    client = SecretClient(vault_url=KVUri, credential=credential)

    main_key = client.get_secret(openapi_key).value
    vector_store = client.get_secret(vectorsecret).value
    computer_vision_key = client.get_secret(computer_vision).value
else:
    print("Running in development mode.")
    # For local use only
    main_key = os.getenv("Main_key")
    vector_store = os.getenv("AZURE_COGNITIVE_SEARCH_API_KEY")
    computer_vision_key = os.getenv("COMPUTER_VISION_SUBSCRIPTION_KEY")
    print(f"main_key: {main_key}")
    print(f"vector_store: {vector_store}")
    print(f"computer_vision_key: {computer_vision_key}")

# Set OpenAI environment variables
os.environ["OPENAI_API_TYPE"] = "azure"
os.environ["OPENAI_API_KEY"] = main_key
os.environ["OPENAI_API_VERSION"] = "2023-05-15"
os.environ["AZURE_OPENAI_ENDPOINT"] = "https://ea-openai.openai.azure.com/"

# Computer Vision setup
computer_vision_api_endpoint = "https://test-computer-vision-extremum.cognitiveservices.azure.com/"
computervision_credentials = CognitiveServicesCredentials(computer_vision_key)
computervision_client = ComputerVisionClient(computer_vision_api_endpoint, computervision_credentials)

# Azure Cognitive Search setup
vector_store_address = "https://cognilink-vectordb.search.windows.net"
vector_store_password = vector_store

# Blob Storage setup
if not IS_PRODUCTION:
    account_name = "testcongnilink"
    container_name = "congnilink-container"
    account_url = "https://testcongnilink.blob.core.windows.net"
    blob_service_client = BlobServiceClient(account_url, credential=DefaultAzureCredential())
else:
    account_name = os.getenv('account_name')
    account_key = os.getenv('account_key')
    container_name = os.getenv('container_name')
    connection_string = f"DefaultEndpointsProtocol=https;AccountName={account_name};AccountKey={account_key};EndpointSuffix=core.windows.net"
    blob_service_client = BlobServiceClient.from_connection_string(connection_string)
    print(f"account_name: {account_name}")
    print(f"account_key: {account_key}")
    print(f"container_name: {container_name}")

container_client = blob_service_client.get_container_client(container_name)

# Embeddings setup
embeddings = AzureOpenAIEmbeddings(azure_deployment='text-embedding')

# Print a message indicating the environment
print("Running in production" if not IS_PRODUCTION else "Running in development")
