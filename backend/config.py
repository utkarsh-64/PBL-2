import os


class Config:
    ENV_MODE = os.environ.get("ENV_MODE", "dev").lower()
    SUFFIX = "_DEV" if ENV_MODE == "dev" else "_PROD"

    def __getattr__(self, name: str):
        """Automatically fetch environment variable with suffix."""
        return os.environ.get(name + self.SUFFIX) or os.environ.get(name)


# Single config instance
config = Config()

# === Export common variables for direct import ===
SITE_URL = config.SITE_URL
FASTAPI_URL = config.FASTAPI_URL
KITE_API_KEY = config.KITE_API_KEY
KITE_API_SECRET = config.KITE_API_SECRET
GOOGLE_CLIENT_ID = config.GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = config.GOOGLE_CLIENT_SECRET
GOOGLE_API_KEY = config.GOOGLE_API_KEY
