from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class CustomerRecord(BaseModel):
    customer_id: str
    name: str
    email: Optional[str] = ""
    phone: Optional[str] = ""
    address: Optional[str] = ""
    city: Optional[str] = ""
    last_updated: Optional[str] = ""
    source: Optional[str] = ""

    class Config:
        extra = "allow"


class CandidateDecision(BaseModel):
    customer_id_1: str
    customer_id_2: str
    customer_1: Optional[Dict[str, Any]] = None
    customer_2: Optional[Dict[str, Any]] = None
    score: float
    action: str  # "MERGE", "PRESERVE", "REVIEW"
    confidence: float
    reason: str
    evidence: List[str] = []
    conflicts: List[str] = []
    field_scores: Dict[str, float] = {}


class MasterRecord(BaseModel):
    master_id: str
    name: str
    email: str
    phone: str
    address: str
    city: str
    last_updated: str
    merged_customer_ids: List[str]
    sources: List[str]
    record_status: str  # "merged", "preserved", "flagged_for_review"


class CleanupSummary(BaseModel):
    total_records: int
    candidates_evaluated: int
    merged_pairs: int
    preserved_pairs: int
    review_pairs: int
    master_records_count: int


class CleanupResponse(BaseModel):
    total_records: int
    user_request: str
    summary: CleanupSummary
    agent_response: str
    decisions: List[CandidateDecision]
    master_dataset: List[MasterRecord]
