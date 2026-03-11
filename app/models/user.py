from pydantic import BaseModel, EmailStr
from typing import Optional

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    age: Optional[int] = None
    gender: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    conditions: Optional[str] = None
    medications: Optional[str] = None
    blood_group: Optional[str] = None
