from config.security_protection import check_password_hash, generate_token, hash_password
from dao.login_dao import login_dao

class login_service:

    # 依賴注入 login_dao
    def __init__(self, dao: login_dao):
        self.dao = dao


    def login(self, username, password):
        user = self.dao.get_user_by_username(username)
        if not user:
            return None, "User not found"

        # 驗證密碼
        if not check_password_hash(user['password_hash'], password):
            return None, "Invalid password"

        # 生成 token
        token = generate_token()
        return {"access_token": token, "username": user["username"]}, None

    def sign_up(self, username, email, password):
        # 檢查輸入數據是否有效
        if not username or not email or not password:
            return None, "Missing required fields"

        # 密碼加密
        hashed_password = hash_password(password)

        # 插入用戶數據
        success = self.dao.sign_up_user(username, email, hashed_password)
        if not success:
            return None, "Failed to register user"

        return "User registered successfully", None

