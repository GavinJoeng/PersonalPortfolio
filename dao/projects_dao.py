from config.db_config import get_db_connection

class projects_dao:
    GET_PROJECT_QUERY = """
        SELECT id, user_id, project_id, title, description, project_photo, technologies, features, challenges
        FROM projects
        WHERE project_id = ? AND user_id = ?
    """

    GET_USER_ID_QUERY = """
        SELECT id FROM users WHERE username = ?
    """

    GET_PROJECTS_QUERY = """
        SELECT user_id, project_id, title, description, project_photo, project_photo_mime_type 
        FROM projects 
        WHERE user_id = ? 
        LIMIT 4
    """

    GET_ALL_PROJECTS_QUERY = """
        SELECT user_id, project_id, title, description, project_photo, project_photo_mime_type 
        FROM projects 
        WHERE user_id = ?
    """

    def _convert_to_dict(self, cursor):
        """
        Convert query results to a list of dictionaries.
        """
        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]

    def get_project(self, project_id, user_id):
        """
        Fetch a single project by project_id and user_id.
        """
        try:
            with get_db_connection() as connection:
                cursor = connection.cursor()
                cursor.execute(self.GET_PROJECT_QUERY, (project_id, user_id))
                row = cursor.fetchone()
                if row:
                    columns = [desc[0] for desc in cursor.description]
                    return dict(zip(columns, row))
                return None
        except Exception as e:
            print(f"Database query failed: {e}")
            return None

    def get_user_id_by_username(self, username):
        """
        Fetch user ID by username.
        """
        try:
            with get_db_connection() as connection:
                cursor = connection.cursor()
                cursor.execute(self.GET_USER_ID_QUERY, (username,))
                row = cursor.fetchone()
                if row:
                    return row[0]  # Directly return the user ID
                return None
        except Exception as e:
            print(f"Database query failed: {e}")
            return None

    def update_project(self, project_data):
        """
        Update a project based on provided data.
        """
        try:
            with get_db_connection() as connection:
                cursor = connection.cursor()
                query, params = generate_update_query(project_data)
                print(f"Executing SQL with data: {project_data}")  # Debugging
                print(f"Generated query: {query}")  # Debugging
                cursor.execute(query, params)
                connection.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Database update failed: {e}")
            try:
                connection.rollback()
            except Exception as rollback_error:
                print(f"Rollback failed: {rollback_error}")
            return False

    def get_four_projects(self, user_id):
        """
        Fetch up to four projects for a given user.
        """
        try:
            with get_db_connection() as connection:
                cursor = connection.cursor()
                cursor.execute(self.GET_PROJECTS_QUERY, (user_id,))
                return self._convert_to_dict(cursor)
        except Exception as e:
            print(f"Database query failed: {e}")
            return None

    def get_all_projects(self, user_id):
        """
        Fetch all projects for a given user.
        """
        try:
            with get_db_connection() as connection:
                cursor = connection.cursor()
                cursor.execute(self.GET_ALL_PROJECTS_QUERY, (user_id,))
                return self._convert_to_dict(cursor)
        except Exception as e:
            print(f"Database query failed: {e}")
            return None


def generate_update_query(data, table_name="projects", condition="project_id = :project_id AND user_id = :user_id"):
    """
    Generate a dynamic SQL UPDATE query.
    """
    if not table_name:
        raise ValueError("Table name must be provided.")
    if not condition:
        raise ValueError("Condition must be provided to prevent updating all rows.")

    base_query = f"UPDATE {table_name} SET "
    update_fields = []
    params = {}

    # Dynamically add fields to update
    if data.get("title") is not None:
        update_fields.append("title = :title")
        params["title"] = data["title"]
    if data.get("description") is not None:
        update_fields.append("description = :description")
        params["description"] = data["description"]
    if data.get("technologies") is not None:
        update_fields.append("technologies = :technologies")
        params["technologies"] = data["technologies"]
    if data.get("features") is not None:
        update_fields.append("features = :features")
        params["features"] = data["features"]
    if data.get("challenges") is not None:
        update_fields.append("challenges = :challenges")
        params["challenges"] = data["challenges"]
    if data.get("project_photo") is not None:
        update_fields.append("project_photo = :project_photo")
        params["project_photo"] = data["project_photo"]
    if data.get("project_photo_mime_type") is not None:
        update_fields.append("project_photo_mime_type = :project_photo_mime_type")
        params["project_photo_mime_type"] = data["project_photo_mime_type"]

    # Add condition parameters
    params.update({k: v for k, v in data.items() if k in condition})

    # If no fields to update, raise an error
    if not update_fields:
        raise ValueError("No fields to update.")

    # Combine query
    query = base_query + ", ".join(update_fields) + f" WHERE {condition}"
    return query, params
