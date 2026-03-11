from pydantic import BaseModel
from typing import Optional, List

class LabReportRequest(BaseModel):
    report_text: str
    member_name: Optional[str] = None

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class PrescriptionRequest(BaseModel):
    prescription_text: str
    breakfast_time: Optional[str] = "8:00 AM"
    lunch_time: Optional[str] = "1:00 PM"
    dinner_time: Optional[str] = "8:00 PM"

class FamilyMember(BaseModel):
    name: str
    relation: str
    age: int
    gender: str
    conditions: Optional[List[str]] = []
    medications: Optional[List[str]] = []
    blood_group: Optional[str] = None
    avatar: Optional[str] = "👤"

class FamilyAnalysisRequest(BaseModel):
    members: List[dict]

class CycleLog(BaseModel):
    period_start: str
    period_end: Optional[str] = None
    cycle_length: Optional[int] = 28
    flow: Optional[str] = "medium"
    symptoms: Optional[List[str]] = []

class CycleAnalysisRequest(BaseModel):
    cycles: List[dict]
    age: int
    symptoms: Optional[List[str]] = []
    bmi: Optional[float] = None
