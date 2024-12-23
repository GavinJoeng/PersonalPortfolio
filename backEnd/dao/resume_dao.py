from config.db_config import get_db_connection
import logging
import base64

class resume_dao:
    GET_RESUME_QUERY = """
        SELECT name, title, email, phone, location, summary, 
               experience, education, skills, profile_photo, profile_photo_mime_type
        FROM resume 
        WHERE user_id = %s AND is_active = 1
        ORDER BY version DESC 
        LIMIT 1;
    """

    UPDATE_RESUME_DATA = """
        UPDATE resume 
        SET name = %(name)s, 
            title = %(title)s, 
            email = %(email)s, 
            phone = %(phone)s, 
            location = %(location)s, 
            summary = %(summary)s, 
            experience = %(experience)s, 
            education = %(education)s, 
            skills = %(skills)s, 
            profile_photo = %(profile_photo)s,
            profile_photo_mime_type = %(profile_photo_mime_type)s
        WHERE user_id = %(user_id)s AND is_active = 1
    """

    INSERT_RESUME_DATA = """
        INSERT INTO resume (user_id, name, title, email, phone, location, summary, experience, education, skills, profile_photo)
        VALUES (%(user_id)s, %(name)s, %(title)s, %(email)s, %(phone)s, %(location)s, %(summary)s, %(experience)s, %(education)s, %(skills)s, %(profile_photo)s, %(profile_photo_mime_type)s)
    """

    def get_resume_info(self, user_id):
        """
        根據用戶ID獲取最新有效的簡歷信息。
        """
        try:
            with get_db_connection() as connection:  # 使用 with 管理連接
                with connection.cursor(dictionary=True) as cursor:
                    cursor.execute(self.GET_RESUME_QUERY, (user_id,))
                    result = cursor.fetchone()
                    cursor.fetchall()  # 確保清空游標中剩餘的結果
                    return result if result else None
        except Exception as e:
            logging.error(f"Database query failed: {e}")
            return None

    def save_resume_info(self, resume_data):
        """
        保存或更新簡歷數據。如果用戶ID存在則更新，否則插入。
        """
        try:
            with get_db_connection() as connection:
                with connection.cursor(dictionary=True) as cursor:
                    # 確認記錄是否存在
                    record_exists = self.record_exists(cursor, resume_data["user_id"])
                    if record_exists:
                        logging.info("Executing UPDATE operation.")
                        cursor.execute(self.UPDATE_RESUME_DATA, resume_data)
                    else:
                        logging.info("Executing INSERT operation.")
                        cursor.execute(self.INSERT_RESUME_DATA, resume_data)

                    # 提交更改
                    connection.commit()
                    return True
        except Exception as e:
            logging.error(f"Error saving resume data: {e}")
            return False

    def record_exists(self, cursor, user_id):
        """
        檢查用戶ID是否存在於數據庫中。
        """
        try:
            cursor.execute("SELECT 1 FROM resume WHERE user_id = %s", (user_id,))
            result = cursor.fetchone()
            cursor.fetchall()  # 確保清空游標中剩餘的結果
            return result is not None
        except Exception as e:
            logging.error(f"Error checking record existence: {e}")
            return False

    def get_user_id_by_email(self, email):
        """
        根據電子郵件地址獲取用戶ID。
        """
        query = "SELECT user_id FROM resume WHERE email = %s LIMIT 1;"
        try:
            with get_db_connection() as connection:
                with connection.cursor(dictionary=True) as cursor:
                    cursor.execute(query, (email,))
                    result = cursor.fetchone()
                    cursor.fetchall()  # 確保清空游標中剩餘的結果
                    return result["user_id"] if result else None
        except Exception as e:
            logging.error(f"Error fetching user_id by email: {e}")
            return None



def main():
    dao = resume_dao()
    user_id = 1
    result = dao.get_resume_info(user_id)
    profile_photo = result.get("profile_photo")
    decoded_photo = base64.b64decode(profile_photo)
    with open("output_photo.jpg", "wb") as f:
        f.write(decoded_photo)
    print("Photo successfully saved as 'output_photo.jpg'")


if __name__ == '__main__':
    main()