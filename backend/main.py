from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from llmHelper import getLlmResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

class UrlRequest(BaseModel):
    question: str
    urls: List[str]

@app.post("/submit-urls/")
async def submit_urls(request: UrlRequest):
    question = request.question
    urls = request.urls
    response = getLlmResponse(question, urls)
    
    return {
        "message": "URLs and question received successfully",
        "question": question,
        "urls": urls,
        "llm_response": response  
    }