from config.db_config import get_db_connection

class login_dao:
    GET_USERS_QUERY = """
            SELECT id, username, email, password_hash FROM users WHERE username = %s
        """
    INSERT_USER_QUERY = """
            INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)
        """

    def get_user_by_username(self, username):
        """
        根據用戶名查詢用戶
        :param username:
        :return:
        """
        connection = get_db_connection()  # 從連接池獲取連接
        try:
            cursor = connection.cursor(dictionary=True)  # 使用字典游標返回列名
            cursor.execute(self.GET_USERS_QUERY, (username,))
            result = cursor.fetchone()
            return result  # 返回結果 (可以是 None 或字典)
        except Exception as e:
            print(f"查詢用戶失敗: {e}")
            return None
        finally:
            cursor.close()
            connection.close()  # 將連接返回給連接池

    def sign_up_user(self, username, email, password):
        """
        插入新用戶數據
        """
        connection = get_db_connection()
        try:
            cursor = connection.cursor()
            cursor.execute(self.INSERT_USER_QUERY, (username, email, password))
            connection.commit()
            return True  # 插入成功
        except Exception as e:
            print(f"插入用戶失敗: {e}")
            return False
        finally:
            cursor.close()
            connection.close()