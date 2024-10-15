import os
import random
import string


def random_hex_string(length=10):
    hex_characters = string.hexdigits.lower()
    return ''.join(random.choice(hex_characters) for _ in range(length))


default_env = {
    "SECRET": random_hex_string(),
    "SQL_USER": "postgres",
    "SQL_PASSWORD": "postgres",
    "SQL_URL": "localhost:5432",
    "SQL_DB": "postgres",
    "SQL_RETRY": "5",
}


def get_env(key: str) -> str:
    if key in os.environ:
        return os.environ[key]
    elif key in default_env:
        return default_env[key]
    else:
        raise KeyError(f"Environment variable {key} not found")
