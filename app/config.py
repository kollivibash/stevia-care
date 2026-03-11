from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    mongodb_url: str
    jwt_secret: str
    jwt_expire_minutes: int = 10080
    app_name: str = "HealthCopilot API"

    class Config:
        env_file = ".env"

settings = Settings()
