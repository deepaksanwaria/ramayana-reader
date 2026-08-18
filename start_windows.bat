@echo off
cd /d "%~dp0"
python scripts\download_data.py
python -m http.server 8000
