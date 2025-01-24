from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from llmHelper import getLlmResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React app's URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Define the Pydantic model to match the structure of the incoming request
class UrlRequest(BaseModel):
    question: str
    urls: List[str]

@app.post("/submit-urls/")
async def submit_urls(request: UrlRequest):
    question = request.question
    urls = request.urls
    print("URLS********",urls)
    # Call the function and get the response
    response = getLlmResponse(question, urls)
    
    return {
        "message": "URLs and question received successfully",
        "question": question,
        "urls": urls,
        "llm_response": response  # Include the LLM response here
    }