from config.db_config import get_db_connection

class projects_dao:
    GET_PROJECT_QUERY = """
        SELECT id, user_id, project_id, title, description, project_photo, technologies, features, challenges
        FROM projects
        WHERE project_id = %s AND user_id = %s
    """

    GET_USER_ID_QUERY = """
        SELECT id FROM users WHERE username = %s
    """

    GET_PROJECTS_QUERY = """
            SELECT user_id, project_id, title, description, project_photo, project_photo_mime_type FROM projects WHERE user_id = %s LIMIT 4
        """

    GET_ALL_PROJECTS_QUERY = """
            SELECT user_id, project_id, title, description, project_photo, project_photo_mime_type FROM projects WHERE user_id = %s 
    """


    def get_project(self, project_id, user_id):
        try:
            with get_db_connection() as connection:
                with connection.cursor(dictionary=True) as cursor:
                    cursor.execute(self.GET_PROJECT_QUERY, (project_id, user_id))
                    result = cursor.fetchone()
                    return result if result else None
        except Exception as e:
            print(f"Database query failed: {e}")
            return None

    def get_user_id_by_username(self, username):
        try:
            with get_db_connection() as connection:
                with connection.cursor(dictionary=True) as cursor:
                    cursor.execute(self.GET_USER_ID_QUERY, (username,))
                    result = cursor.fetchone()
                    return result["id"] if result else None
        except Exception as e:
            print(f"Database query failed: {e}")
            return None

    # DAO 層方法的改進
    def update_project(self, project_data):
        try:
            with get_db_connection() as connection:
                with connection.cursor(dictionary=True) as cursor:
                    print(f"Executing SQL with data: {project_data}")  # 調試用
                    query, params = generate_update_query(project_data)
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

    def get_four_projects(self, user_id):
        try:
            with get_db_connection() as connection:
                with connection.cursor(dictionary=True) as cursor:
                    cursor.execute(self.GET_PROJECTS_QUERY, (user_id,))
                    result = cursor.fetchall()
                    return result if result else None
        except Exception as e:
            print(f"Database query failed: {e}")
            return None

    def get_all_projects(self, user_id):
        try:
            with get_db_connection() as connection:
                with connection.cursor(dictionary=True) as cursor:
                    cursor.execute(self.GET_ALL_PROJECTS_QUERY, (user_id,))
                    result = cursor.fetchall()
                    return result if result else None
        except Exception as e:
            print(f"Database query failed: {e}")
            return None


def generate_update_query(data, table_name="projects", condition="project_id = %(project_id)s AND user_id = %(user_id)s"):
    if not table_name:
        raise ValueError("Table name must be provided.")
    if not condition:
        raise ValueError("Condition must be provided to prevent updating all rows.")

    base_query = f"UPDATE {table_name} SET "
    update_fields = []
    params = {}

    # 動態添加字段
    if data.get("title") is not None:
        update_fields.append("title = %(title)s")
        params["title"] = data["title"]
    if data.get("description") is not None:
        update_fields.append("description = %(description)s")
        params["description"] = data["description"]
    if data.get("technologies") is not None:
        update_fields.append("technologies = %(technologies)s")
        params["technologies"] = data["technologies"]
    if data.get("features") is not None:
        update_fields.append("features = %(features)s")
        params["features"] = data["features"]
    if data.get("challenges") is not None:
        update_fields.append("challenges = %(challenges)s")
        params["challenges"] = data["challenges"]
    if data.get("project_photo") is not None and data["project_photo"]:
        update_fields.append("project_photo = %(project_photo)s")
        params["project_photo"] = data["project_photo"]
    if data.get("project_photo_mime_type") is not None and data["project_photo_mime_type"]:
        update_fields.append("project_photo_mime_type = %(project_photo_mime_type)s")
        params["project_photo_mime_type"] = data["project_photo_mime_type"]

    # 添加條件參數
    for key, value in data.items():
        if key in condition and value is not None:
            params[key] = value

    # 如果沒有字段需要更新，報錯
    if not update_fields:
        raise ValueError("No fields to update.")

    # 組合查詢語句
    query = base_query + ", ".join(update_fields) + f" WHERE {condition}"
    return query, params




