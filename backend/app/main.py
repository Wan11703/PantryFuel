from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database.session import engine

from app.api.routes.auth import router as auth_router


app = FastAPI(
    title="PantryFuel API",
    description="Smart pantry, recipe recommendation, and nutrition tracking API",
    version="0.1.0",
)


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/")
async def root():
    return {
        "message": "PantryFuel API is running"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }


@app.get("/health/database")
async def database_health():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {
        "database": "connected"
    }