from datetime import datetime

from pydantic import BaseModel


class DailyReportBase(BaseModel):
    date: datetime
    location: str
    people_served: int = 0
    meals_prepared: int = 0
    meals_remaining: int = 0
    food_menu: str
    team_leader_id: int
    volunteers_count: int = 0
    weather: str
    start_time: str
    end_time: str
    notes: str | None = None
    status: str = "Pending"


class DailyReportCreate(DailyReportBase):
    pass


class DailyReportUpdate(BaseModel):
    date: datetime | None = None
    location: str | None = None
    people_served: int | None = None
    meals_prepared: int | None = None
    meals_remaining: int | None = None
    food_menu: str | None = None
    team_leader_id: int | None = None
    volunteers_count: int | None = None
    weather: str | None = None
    start_time: str | None = None
    end_time: str | None = None
    notes: str | None = None
    status: str | None = None


class DailyReportResponse(DailyReportBase):
    id: int
    team_leader_name: str = ""
    video_count: int = 0
    created_by: int
    created_at: datetime

    model_config = {"from_attributes": True}
