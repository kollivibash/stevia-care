from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    mongodb_url: str
    jwt_secret: str
    groq_api_key: Optional[str] = ""
    jwt_expire_minutes: int = 10080
    app_name: str = "Stevia Care API"

    class Config:
        env_file = ".env"

settings = Settings()
