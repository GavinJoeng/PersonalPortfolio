from config.db_config import get_db_connection

class personal_center_dao:
    GET_PERSONAL_INFO_QUERY = """
        SELECT
                a.id AS user_id,
                a.username AS user_username,
                c.phone AS user_phone,
                c.email AS user_email,
                a.welcome_text AS user_welcome_text,
                a.introduction AS user_introduction,
                b.name AS message_name,
                b.email AS message_email,
                b.message AS message_content
            FROM
                users a,
                messages b,
                resume c
            WHERE
                a.username = ?
                AND a.status = 1
                AND b.user_id = a.id
                AND c.user_id = a.id
                AND c.is_active = 1
            ORDER BY
            b.created_at DESC
            LIMIT 10
    """

    GET_INDEX_INFO_QUERY = """
        SELECT 
        id AS user_id,
        welcome_text AS user_welcome_text,
        introduction AS user_introduction
        FROM users
        WHERE 
        username = ?
        AND status = 1
    """

    INSERT_USER_MSG = """
        INSERT INTO messages (user_id, webpage_id, name, email, message)
        VALUES (?, ?, ?, ?, ?)
    """

    def _convert_to_dict(self, cursor):
        """
        Convert query results to a list of dictionaries.
        """
        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]

    def get_personal_info(self, username):
        """
        Fetch personal info for a given username.
        """
        try:
            with get_db_connection() as connection:
                cursor = connection.cursor()
                cursor.execute(self.GET_PERSONAL_INFO_QUERY, (username,))
                result = self._convert_to_dict(cursor)
                return result if result else None
        except Exception as e:
            print(f"Database query failed: {e}")
            return None

    def get_index_info(self, username):
        """
        Fetch index info for a given username.
        """
        try:
            with get_db_connection() as connection:
                cursor = connection.cursor()
                cursor.execute(self.GET_INDEX_INFO_QUERY, (username,))
                row = cursor.fetchone()
                if row:
                    columns = [desc[0] for desc in cursor.description]
                    return dict(zip(columns, row))
                return None
        except Exception as e:
            print(f"Database query failed: {e}")
            return None



    def send_msg(self, msg):
        """
        Insert a new message.
        """
        try:
            with get_db_connection() as connection:
                cursor = connection.cursor()
                cursor.execute(self.INSERT_USER_MSG, msg)
                connection.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Database insert failed: {e}")
            try:
                connection.rollback()
            except Exception as rollback_error:
                print(f"Rollback failed: {rollback_error}")
            return False

    def update_personal_info(self, personal_info):
        """
        Update personal information (welcome text, introduction, phone, email).
        Only updates fields that are provided in the input data.
        """
        try:
            with get_db_connection() as connection:
                cursor = connection.cursor()

                # Prepare SQL query and parameters
                update_queries = []
                params = {}

                # Update users table
                if 'user_welcome_text' in personal_info or 'user_introduction' in personal_info:
                    set_clause = []
                    if 'user_welcome_text' in personal_info:
                        set_clause.append("welcome_text = :user_welcome_text")
                        params['user_welcome_text'] = personal_info['user_welcome_text']
                    if 'user_introduction' in personal_info:
                        set_clause.append("introduction = :user_introduction")
                        params['user_introduction'] = personal_info['user_introduction']

                    if set_clause:
                        update_queries.append(
                            f"UPDATE users SET {', '.join(set_clause)} WHERE username = :username AND status = 1")
                        params['username'] = personal_info['username']

                # Update resume table
                if 'user_phone' in personal_info or 'user_email' in personal_info:
                    set_clause = []
                    if 'user_phone' in personal_info:
                        set_clause.append("phone = :user_phone")
                        params['user_phone'] = personal_info['user_phone']
                    if 'user_email' in personal_info:
                        set_clause.append("email = :user_email")
                        params['user_email'] = personal_info['user_email']

                    if set_clause:
                        update_queries.append(f"""
                            UPDATE resume 
                            SET {', '.join(set_clause)} 
                            WHERE user_id = (SELECT id FROM users WHERE username = :username) AND is_active = 1
                        """)

                # Execute queries if there are any to update
                if update_queries:
                    for query in update_queries:
                        cursor.execute(query, params)

                    connection.commit()
                    return True

        except Exception as e:
            print(f"Error updating personal info: {e}")
            try:
                connection.rollback()
            except Exception as rollback_error:
                print(f"Rollback failed: {rollback_error}")
            return False



if __name__ == '__main__':
    # 創建 PersonalCenterDAO 的實例
    dao = personal_center_dao()

    # 測試數據
    test_username = "gavinjoeng"  # Replace with a valid username in your database

    # 測試 get_index_info 方法
    print("Testing get_index_info...")
    index_info = dao.get_index_info(test_username)
    if index_info:
        print("Index Info Retrieved Successfully:")
        print(index_info)
    else:
        print("No data found for the provided username.")
