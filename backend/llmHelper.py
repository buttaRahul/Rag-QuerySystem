from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
import os
import langchain

from langchain.chains import RetrievalQAWithSourcesChain
from langchain.chains.qa_with_sources.loading import load_qa_with_sources_chain
from langchain_community.document_loaders import UnstructuredURLLoader
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceHubEmbeddings
import pickle



def getLlmResponse(question,urls):

    load_dotenv()
    print(os.getenv("GOOGLE_API_KEY"))
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        temperature=0.6,
        max_tokens=None,
        timeout=None,
        max_retries=10,
    )


    loader = UnstructuredURLLoader(urls=urls)

    data = loader.load()


    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size = 1000,  
        separators= ['\n\n','\n','.',',']
        # chunk_overlap=50
    )

    docs = text_splitter.split_documents(data)

    model = "sentence-transformers/all-mpnet-base-v2" 
    hf_token = os.getenv("HUGGINGFACE_API_KEY")
    embeddings = HuggingFaceHubEmbeddings(
        model=model,
        task="feature-extraction",
        huggingfacehub_api_token=hf_token,
    )


    vectorindices = FAISS.from_documents(docs,embeddings)

    
    file_path ="vector_index.pxl"
    with open(file_path,"wb") as f:
        pickle.dump(vectorindices,f)
    if question:
        if os.path.exists(file_path):
            with open(file_path,"rb") as f:
                vectoIndex = pickle.load(f)
                chain = RetrievalQAWithSourcesChain.from_llm(llm=llm,retriever=vectoIndex.as_retriever())
                response = chain.invoke({"question":question},return_only_outputs=True)
                print(response)

    return response
    
        
    

