import io
import json
import csv
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from cleanup import cleanup_customers
from models import CleanupResponse


app = FastAPI(
    title="Data Cleanup Agent",
    description="Autonomous data-quality and deduplication agent for customer datasets.",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Starter test case definitions from challenge document
TEST_CASES = {
    "test_a": {
        "id": "test_a",
        "title": "Test Input A — Duplicate candidates",
        "prompt": "Find duplicate customer records. Merge only when you are confident; flag uncertain cases.",
        "description": "Evaluates confident merge (Sneha Srirampur vs S. Srirampur) and ambiguous case (Sneha vs Sneh with house number conflict).",
        "customers": [
            {
                "customer_id": "C1001",
                "name": "Sneha Srirampur",
                "email": "sneha@gmail.com",
                "phone": "9876543210",
                "address": "12 Lake Road",
                "city": "Hyderabad",
                "last_updated": "2026-09-10",
                "source": "CRM"
            },
            {
                "customer_id": "C1044",
                "name": "S. Srirampur",
                "email": "sneha@gmail.com",
                "phone": "9876543210",
                "address": "12 Lake Rd",
                "city": "Hyderabad",
                "last_updated": "2026-09-12",
                "source": "Support"
            },
            {
                "customer_id": "C1088",
                "name": "Sneh Srirampur",
                "email": "srirampur@gmail.com",
                "phone": "9876543210",
                "address": "14 Lake Road",
                "city": "Hyderabad",
                "last_updated": "2026-09-15",
                "source": "Web"
            }
        ]
    },
    "test_b": {
        "id": "test_b",
        "title": "Test Input B — Same name, different person",
        "prompt": "Clean duplicates but do not merge two different customers just because their names match.",
        "description": "Verifies that matching names with distinct emails, phones, and addresses are preserved separately.",
        "customers": [
            {
                "customer_id": "C2001",
                "name": "Rahul Kumar",
                "email": "rahul1@example.com",
                "phone": "9000000001",
                "address": "10 MG Road",
                "city": "Bengaluru",
                "last_updated": "2026-09-01",
                "source": "CRM"
            },
            {
                "customer_id": "C2002",
                "name": "Rahul Kumar",
                "email": "rahul2@example.com",
                "phone": "9000000002",
                "address": "22 Park Street",
                "city": "Hyderabad",
                "last_updated": "2026-09-02",
                "source": "Web"
            }
        ]
    },
    "test_c": {
        "id": "test_c",
        "title": "Test Input C — Conflicting record",
        "prompt": "Resolve duplicate candidates conservatively.",
        "description": "Ensures conflicting contact information (differing phones) prevents unsafe automatic merging and triggers review.",
        "customers": [
            {
                "customer_id": "C3001",
                "name": "Anita Rao",
                "email": "anita@example.com",
                "phone": "9111111111",
                "address": "5 Green Avenue",
                "city": "Chennai",
                "last_updated": "2026-08-01",
                "source": "CRM"
            },
            {
                "customer_id": "C3002",
                "name": "Anita Rao",
                "email": "anita@example.com",
                "phone": "9222222222",
                "address": "5 Green Avenue",
                "city": "Chennai",
                "last_updated": "2026-08-20",
                "source": "Billing"
            }
        ]
    }
}


class JsonCleanupRequest(BaseModel):
    customers: List[Dict[str, Any]]
    user_request: str


@app.get("/")
def home():
    return {
        "status": "online",
        "service": "The Data Cleanup Agent",
        "description": "Autonomous data-quality and deduplication system.",
        "endpoints": {
            "POST /cleanup": "Process dataset via multipart file or JSON",
            "GET /test-cases": "Retrieve starter test cases A, B, and C",
            "POST /cleanup/test/{test_id}": "Execute starter test case directly"
        }
    }


@app.get("/test-cases")
def get_test_cases():
    return list(TEST_CASES.values())


@app.post("/cleanup/test/{test_id}", response_model=CleanupResponse)
def run_test_case(test_id: str):
    if test_id not in TEST_CASES:
        raise HTTPException(status_code=404, detail=f"Test case '{test_id}' not found. Available: {list(TEST_CASES.keys())}")
    
    test_case = TEST_CASES[test_id]
    result = cleanup_customers(test_case["customers"], test_case["prompt"])
    return result


@app.post("/cleanup/json", response_model=CleanupResponse)
def cleanup_json(request: JsonCleanupRequest):
    if not request.customers:
        raise HTTPException(status_code=400, detail="Customer dataset is empty.")
    result = cleanup_customers(request.customers, request.user_request)
    return result


@app.post("/cleanup")
async def cleanup(
    file: Optional[UploadFile] = File(None),
    user_request: Optional[str] = Form(None),
    payload: Optional[JsonCleanupRequest] = Body(None)
):
    # Support both JSON Body and Multipart File Upload
    if payload is not None:
        return cleanup_customers(payload.customers, payload.user_request)

    if file is None or user_request is None:
        raise HTTPException(status_code=400, detail="Must provide either JSON payload or file upload with user_request.")

    contents = await file.read()
    filename = (file.filename or "").lower()

    customers = []
    if filename.endswith(".csv"):
        text_content = contents.decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(text_content))
        customers = list(reader)
    else:
        try:
            customers = json.loads(contents)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse JSON file: {e}")

    if not isinstance(customers, list):
        raise HTTPException(status_code=400, detail="Dataset must be a list of customer records.")

    result = cleanup_customers(customers, user_request)
    return result