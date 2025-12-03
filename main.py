"""
Kuy Eng Restaurant - Main Entry Point
"""
from app import create_app
from fastapi import FastAPI
from mangum import Mangum

app = FastAPI()

handler = Mangum(app)

