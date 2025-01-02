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
                a.username = %s
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
        username = %s
        AND status = 1
        
    """

    INSERT_USER_MSG = """
    INSERT INTO message (user_id, webpage_id, `name`, email, message)
    VALUES ( %s, %s, %s, %s, %s)
    """

    def get_personal_info(self, username):
        try:
            with get_db_connection() as connection:
                with connection.cursor(dictionary=True) as cursor:
                    cursor.execute(self.GET_PERSONAL_INFO_QUERY, (username,))
                    # 不只是一條數據噢!!!
                    result = cursor.fetchall()
                    return result if result else None
        except Exception as e:
            print(f"Database query failed: {e}")
            return None

    def get_index_info(self,username):
        try:
            with get_db_connection() as connection:
                with connection.cursor(dictionary=True) as cursor:
                    cursor.execute(self.GET_INDEX_INFO_QUERY, (username,))
                    result = cursor.fetchone()
                    return result if result else None
        except Exception as e:
            print(f"Database query failed: {e}")
            return None

    def update_personal_info(self, personal_info):
        try:
            with get_db_connection() as connection:
                with connection.cursor(dictionary=True) as cursor:
                    print(f"Executing SQL with data: {personal_info}")  # 調試用
                    query, params = generate_update_query(personal_info)
                    # 執行查詢
                    cursor.execute(query, params)
                    # 提交更改
                    connection.commit()
                    return cursor.rowcount > 0  # 確保至少有一行更新
        except Exception as e:
            print(f"Database update failed: {e}")
            try:
                connection.rollback()  # 如果提交失敗，進行回滾
            except Exception as rollback_error:
                print(f"Rollback failed: {rollback_error}")
            return False

    def send_msg(self,msg):
        try:
            with get_db_connection() as connection:
                with connection.cursor(dictionary=True) as cursor:
                    # 執行查詢
                    cursor.execute(self.INSERT_USER_MSG, msg)
                    # 提交更改
                    connection.commit()
                    return cursor.rowcount > 0  # 確保至少有一行更新
        except Exception as e:
            print(f"Database update failed: {e}")
        try:
            connection.rollback()  # 如果提交失敗，進行回滾
        except Exception as rollback_error:
            print(f"Rollback failed: {rollback_error}")
        return False


def generate_update_query(data, table_name="users a, resume b", condition="a.username = %(user_username)s AND b.user_id = a.id AND b.is_active = 1 AND a.status = 1"):
    """
    Generates a dynamic SQL UPDATE query.

    :param data: A dictionary containing column-value pairs to be updated.
    :param table_name: The table(s) to be updated.
    :param condition: The WHERE clause condition as a string.
    :return: A tuple containing the SQL query string and the parameters for the query.
    """
    if not table_name:
        raise ValueError("Table name must be provided.")
    if not condition:
        raise ValueError("Condition must be provided to prevent updating all rows.")

    base_query = f"UPDATE {table_name} SET "
    update_fields = []
    params = {}

    # Dynamically add fields to update
    if data.get("user_phone") is not None:
        update_fields.append("b.phone = %(user_phone)s")
        params["user_phone"] = data["user_phone"]
    if data.get("user_email") is not None:
        update_fields.append("b.email = %(user_email)s")
        params["user_email"] = data["user_email"]
    if data.get("user_welcome_text") is not None:
        update_fields.append("a.welcome_text = %(user_welcome_text)s")
        params["user_welcome_text"] = data["user_welcome_text"]
    if data.get("user_introduction") is not None:
        update_fields.append("a.introduction = %(user_introduction)s")
        params["user_introduction"] = data["user_introduction"]

    # Add conditional parameters
    params["user_username"] = data.get("user_username")

    # If no fields to update, raise an error
    if not update_fields:
        raise ValueError("No fields to update.")

    # Combine query
    query = base_query + ", ".join(update_fields) + f" WHERE {condition}"
    return query, params


