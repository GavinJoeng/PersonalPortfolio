import hashlib
import secrets

def generate_password_hash(password):
    """
    為用戶密碼生成哈希值。
    """
    return hashlib.sha256(password.encode()).hexdigest()

def check_password_hash(stored_hash, password):
    """
    驗證用戶密碼是否匹配。
    """
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    return hashed_password == stored_hash

def generate_token():
    """
    生成一個隨機的會話 token。
    """
    return secrets.token_hex(16)

def hash_password(password):
    """
    使用 SHA-256 加密密碼。
    :param password: 明文密碼
    :return: 哈希密碼
    """
    return hashlib.sha256(password.encode()).hexdigest()