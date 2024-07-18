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

if not IS_PRODUCTION:
    # For local use only
    main_key = os.environ["Main_key"]
    vector_store = os.environ["AZURE_COGNITIVE_SEARCH_API_KEY"]
    computer_vision_key = os.environ["COMPUTER_VISION_SUBSCRIPTION_KEY"]
else:
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
    account_name = os.environ['account_name']
    account_key = os.environ['account_key']
    container_name = os.environ['container_name']
    connection_string = f"DefaultEndpointsProtocol=https;AccountName={account_name};AccountKey={account_key};EndpointSuffix=core.windows.net"
    blob_service_client = BlobServiceClient.from_connection_string(connection_string)
else:
    account_name = "testcongnilink"
    container_name = "congnilink-container"
    account_url = "https://testcongnilink.blob.core.windows.net"
    blob_service_client = BlobServiceClient(account_url, credential=DefaultAzureCredential())

container_client = blob_service_client.get_container_client(container_name)

# Embeddings setup
embeddings = AzureOpenAIEmbeddings(azure_deployment='text-embedding')

# Print a message indicating the environment
print("Running in production" if IS_PRODUCTION else "Running in development")
