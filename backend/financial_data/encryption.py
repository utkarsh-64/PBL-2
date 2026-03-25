import os
from cryptography.fernet import Fernet


def _get_fernet() -> Fernet:
    key = os.getenv("TOKEN_ENCRYPTION_KEY")
    if not key:
        raise ValueError("TOKEN_ENCRYPTION_KEY is not set in environment variables.")
    return Fernet(key.encode())


def encrypt_token(plain_text: str) -> str:
    """Encrypt a plaintext token string. Returns a UTF-8 encoded ciphertext string."""
    if not plain_text:
        return plain_text
    return _get_fernet().encrypt(plain_text.encode()).decode()


def decrypt_token(cipher_text: str) -> str:
    """Decrypt a ciphertext token string. Returns the original plaintext."""
    if not cipher_text:
        return cipher_text
    return _get_fernet().decrypt(cipher_text.encode()).decode()
