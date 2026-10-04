#!/usr/bin/env python3
"""Publish Universe Explorer to a Hugging Face Space.

    pip install -U huggingface_hub
    python deploy.py                 # creates <your-username>/universe-explorer
    python deploy.py my-space-name   # or pick another name

Needs a Hugging Face access token with "write" permission
(https://huggingface.co/settings/tokens). Set HF_TOKEN or paste it when asked.
"""
import getpass
import os
import sys
from pathlib import Path

from huggingface_hub import HfApi

token = os.environ.get("HF_TOKEN") or getpass.getpass("Hugging Face write token: ").strip()
api = HfApi(token=token)
user = api.whoami()["name"]
name = sys.argv[1] if len(sys.argv) > 1 else "universe-explorer"
repo_id = f"{user}/{name}"

api.create_repo(repo_id, repo_type="space", space_sdk="static", exist_ok=True)
api.upload_folder(
    folder_path=Path(__file__).resolve().parent,
    repo_id=repo_id,
    repo_type="space",
    allow_patterns=["index.html", "README.md"],
    commit_message="Deploy Universe Explorer",
)
print(f"Done! Your app is live at https://huggingface.co/spaces/{repo_id}")
