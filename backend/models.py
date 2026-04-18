from pydantic import BaseModel, field_validator

class UserAuth(BaseModel):
    name: str
    password: str

    @field_validator("name")
    @classmethod
    def lowercase_name(cls, v: str) -> str:
        return v.lower()

class UserNoteInput(BaseModel):
    title: str
    content: str

class BanStatus(BaseModel):
    ban_status: int