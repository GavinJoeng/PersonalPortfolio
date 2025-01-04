from config.db_config import get_db_connection
import logging
import base64
import traceback

class resume_dao:
    GET_RESUME_QUERY = """
        SELECT name, title, email, phone, location, summary, 
               experience, education, skills, profile_photo, profile_photo_mime_type
        FROM resume 
        WHERE user_id = ? AND is_active = 1
        ORDER BY version DESC 
        LIMIT 1;
    """

    UPDATE_RESUME_DATA = """
        UPDATE resume 
        SET name = :name, 
            title = :title, 
            email = :email, 
            phone = :phone, 
            location = :location, 
            summary = :summary, 
            experience = :experience, 
            education = :education, 
            skills = :skills, 
            profile_photo = :profile_photo,
            profile_photo_mime_type = :profile_photo_mime_type
        WHERE user_id = :user_id AND is_active = 1
    """

    INSERT_RESUME_DATA = """
        INSERT INTO resume (user_id, name, title, email, phone, location, summary, experience, education, skills, profile_photo, profile_photo_mime_type)
        VALUES (:user_id, :name, :title, :email, :phone, :location, :summary, :experience, :education, :skills, :profile_photo, :profile_photo_mime_type)
    """



    def get_resume_info(self, user_id):
        try:
            with get_db_connection() as connection:
                cursor = connection.cursor()
                cursor.execute(self.GET_RESUME_QUERY, (user_id,))
                row = cursor.fetchone()
                if row:
                    columns = [desc[0] for desc in cursor.description]
                    return dict(zip(columns, row))
                return None
        except Exception as e:
            print(f"Database query failed: {e}")
            print(traceback.format_exc())  # 打印堆棧跟蹤
            return None

    def save_resume_info(self, resume_data):
        """
        Save or update resume data. Updates if the user ID exists; inserts otherwise.
        """
        try:
            with get_db_connection() as connection:
                cursor = connection.cursor()
                # Check if record exists
                record_exists = self.record_exists(cursor, resume_data["user_id"])
                if record_exists:
                    logging.info("Executing UPDATE operation.")
                    query, params = generate_update_query(resume_data)
                    cursor.execute(query, params)
                else:
                    logging.info("Executing INSERT operation.")
                    query, params = generate_insert_query(resume_data)
                    cursor.execute(query, params)

                connection.commit()
                return True
        except Exception as e:
            print(f"Error saving resume data: {e}")
            try:
                connection.rollback()
            except Exception as rollback_error:
                print(f"Rollback failed: {rollback_error}")
            return False

    def record_exists(self, cursor, user_id):
        """
        Check if a record exists for the given user ID.
        """
        try:
            cursor.execute("SELECT 1 FROM resume WHERE user_id = ? AND is_active = 1", (user_id,))
            return cursor.fetchone() is not None
        except Exception as e:
            logging.error(f"Error checking record existence: {e}")
            return False

    def get_user_id_by_email(self, email):
        """
        Fetch user ID by email.
        """
        query = "SELECT user_id FROM resume WHERE email = ? LIMIT 1;"
        try:
            with get_db_connection() as connection:
                cursor = connection.cursor()
                cursor.execute(query, (email,))
                row = cursor.fetchone()
                return row[0] if row else None
        except Exception as e:
            logging.error(f"Error fetching user_id by email: {e}")
            return None


def generate_update_query(data, table_name="resume", condition="user_id = :user_id AND is_active = 1"):
    """
    Generate a dynamic SQL UPDATE query.
    """
    base_query = f"UPDATE {table_name} SET "
    update_fields = []
    params = {}

    for key, value in data.items():
        if key not in ("user_id", "is_active") and value is not None:
            update_fields.append(f"{key} = :{key}")
            params[key] = value

    if not update_fields:
        raise ValueError("No fields to update.")

    params["user_id"] = data["user_id"]

    query = base_query + ", ".join(update_fields) + f" WHERE {condition}"
    return query, params


def generate_insert_query(data, table_name="resume"):
    """
    Generate a dynamic SQL INSERT query.
    """
    keys = [key for key in data if data[key] is not None]
    values = [f":{key}" for key in keys]
    params = {key: data[key] for key in keys}

    query = f"INSERT INTO {table_name} ({', '.join(keys)}) VALUES ({', '.join(values)})"
    return query, params


def main():
    dao = resume_dao()
    user_id = 1
    result = dao.get_resume_info(user_id)
    print(result)
    if result:
        profile_photo = result.get("profile_photo")
        if profile_photo:
            decoded_photo = base64.b64decode(profile_photo)
            with open("output_photo.jpg", "wb") as f:
                f.write(decoded_photo)
            print("Photo successfully saved as 'output_photo.jpg'")
        else:
            print("No profile photo available.")
    else:
        print("No resume information found.")


if __name__ == '__main__':
    main()
