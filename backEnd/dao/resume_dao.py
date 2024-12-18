from config.db_config import get_db_connection

class resume_dao:
    GET_RESUME_QUERY = """
        SELECT name, email, phone, location, summary, 
               experience, education, skills, profile_photo_url
        FROM resume 
        WHERE user_id = %s AND is_active = 1
        ORDER BY version DESC 
        LIMIT 1;
    """

    def get_resume_info(self, user_id):
        """
        根據用戶ID獲取最新有效的簡歷信息。
        """
        print(f'DAO user_id: {user_id}')

        try:
            with get_db_connection() as connection:  # 使用 with 管理連接
                with connection.cursor(dictionary=True) as cursor:
                    cursor.execute(self.GET_RESUME_QUERY, (user_id,))
                    result = cursor.fetchone()
                    return result if result else None
        except Exception as e:
            print(f"Database query failed: {e}")
            return None


if __name__ == "__main__":
    dao = resume_dao()
    user_id = 1
    resume_info = dao.get_resume_info(user_id)
    if resume_info:
        print("查詢到的簡歷信息:", resume_info)
    else:
        print("未找到該用戶的有效簡歷")
