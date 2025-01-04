from dao.projects_dao import projects_dao
import json
import base64
import os
import mimetypes

from models.projects_model import projects_model


class projects_service:
    TEMP_UPLOAD_FOLDER = './temp_uploads'

    def __init__(self, dao: projects_dao):
        self.dao = dao

    def get_user_id(self, username):
        """根據 username 獲取 user_id"""
        return self.dao.get_user_id_by_username(username)

    def handle_temp_photo(self, temp_id):
        """處理臨時圖片，返回 Base64 編碼的字符串和 MIME 類型"""
        temp_file_path = self._find_temp_file(temp_id)
        if not temp_file_path:
            return None, None

        try:
            with open(temp_file_path, "rb") as f:
                photo_data = f.read()
                mime_type, _ = mimetypes.guess_type(temp_file_path)
                mime_type = mime_type or "application/octet-stream"
                encoded_photo = base64.b64encode(photo_data).decode("utf-8")
            os.remove(temp_file_path)
            return encoded_photo, mime_type
        except Exception as e:
            print(f"Error processing temp photo: {e}")
            return None, None

    def _find_temp_file(self, temp_id):
        """查找臨時文件"""
        for file_name in os.listdir(self.TEMP_UPLOAD_FOLDER):
            if file_name.startswith(temp_id):
                return os.path.join(self.TEMP_UPLOAD_FOLDER, file_name)
        return None

    def prepare_project_data(self, project_data):
        """準備項目數據，包括處理圖片和序列化"""
        username = project_data.get("username")
        user_id = self.get_user_id(username)
        if not user_id:
            raise ValueError(f"User ID not found for username: {username}")

        project_data["user_id"] = user_id

        # 處理 project_photo
        if project_data.get("project_photo"):
            project_photo, mime_type = self.handle_temp_photo(project_data["project_photo"])
            project_data["project_photo"] = project_photo
            project_data["project_photo_mime_type"] = mime_type
        else:
            project_data["project_photo"] = None
            project_data["project_photo_mime_type"] = None

        return project_data

    def serialize_project(self, project_data):
        """序列化項目數據為字典"""
        project = projects_model.from_dict(project_data)
        project_dict = project.to_dict()
        return project_dict

    def _decode_project_photo(self, photo, mime_type):
        """解碼項目圖片的 Base64 字符串"""
        if not photo:
            return None
        try:
            decoded_photo = base64.b64decode(photo)
            base64_photo = base64.b64encode(decoded_photo).decode("utf-8")
            return f"data:{mime_type};base64,{base64_photo}"
        except Exception as e:
            print(f"Error decoding Base64 project photo: {e}")
            return None


    def update_project(self, project_data):
        """更新項目數據"""
        try:
            project_data = self.prepare_project_data(project_data)
            project_dict = self.serialize_project(project_data)
            success = self.dao.update_project(project_dict)

            if not success:
                print("Error: No rows updated in the database.")
                return False

            updated_project = self.get_project(project_dict["project_id"], project_data["username"])
            if isinstance(updated_project, dict):
                return updated_project  # 如果返回字典，直接返回
            if updated_project:
                return updated_project.to_dict()  # 返回對象的字典表示
            return False
        except Exception as e:
            print(f"Error updating project: {e}")
            return False

    def get_project(self, project_id, username):
        user_id = self.dao.get_user_id_by_username(username)
        if not user_id:
            return None
        result = self.dao.get_project(project_id, user_id)


        if result:
            # JSON 解析
            technologies = json.loads(result["technologies"]) if result.get("technologies") else []
            features = json.loads(result["features"]) if result.get("features") else []

            # 初始化 mime_type 默認值
            mime_type = "image/jpeg"

            if result.get("project_photo"):
                # MIME 类型处理
                mime_type = result.get("project_photo_mime_type", "image/jpeg")
                project_photo = result.get("project_photo")
                try:
                    decoded_photo = base64.b64decode(project_photo)  # 将 Base64 字符串解码成二进制数据

                    # 确保 Base64 的字符串格式正确
                    base64_photo = base64.b64encode(decoded_photo).decode("utf-8")  # 再次编码为 Base64 字符串
                    result["project_photo"] = f"data:{mime_type};base64,{base64_photo}"
                except Exception as e:
                    print(f"Error decoding Base64 project photo: {e}")
                    result["project_photo"] = None

            # 返回 ProjectModel 对象
            return projects_model(
                project_id=result.get("project_id"),
                user_id=result.get("user_id"),
                title=result.get("title", ""),
                description=result.get("description", ""),
                project_photo=result.get("project_photo"),
                technologies=technologies,
                features=features,
                challenges=result.get("challenges"),
                project_photo_mime_type=mime_type  # 確保這裡使用已初始化的 mime_type
            )
        return None

    def get_four_projects(self, username):
        user_id = self.dao.get_user_id_by_username(username)
        if not user_id:
            return None

        # 獲取多條項目數據
        projects_data = self.dao.get_four_projects(user_id)

        if projects_data:
            processed_projects = []
            for result in projects_data:
                # 初始化 MIME 類型
                mime_type = "image/jpeg"
                project_photo = result.get("project_photo")

                if project_photo:

                    try:
                        decoded_photo = base64.b64decode(project_photo)  # 将 Base64 字符串解码成二进制数据
                        # 确保 Base64 的字符串格式正确
                        base64_photo = base64.b64encode(decoded_photo).decode("utf-8")  # 再次编码为 Base64 字符串
                        result["project_photo"] = f"data:{mime_type};base64,{base64_photo}"
                    except Exception as e:
                        print(f"Error processing project photo for project ID {result.get('project_id')}: {e}")
                        result["project_photo"] = None

                # 添加格式化的項目數據到結果列表
                processed_projects.append({
                    "project_id": result.get("project_id"),
                    "user_id": result.get("user_id"),
                    "title": result.get("title", ""),
                    "description": result.get("description", ""),
                    "project_photo": result.get("project_photo"),
                    "project_photo_mime_type": mime_type
                })

            # 返回處理後的多條項目數據
            return processed_projects

        return None


    def get_all_projects(self, username):
        user_id = self.dao.get_user_id_by_username(username)
        if not user_id:
            return None

        # 獲取多條項目數據
        projects_data = self.dao.get_all_projects(user_id)

        if projects_data:
            processed_projects = []
            for result in projects_data:
                # 初始化 MIME 類型
                mime_type = "image/jpeg"
                project_photo = result.get("project_photo")

                if project_photo:

                    try:
                        decoded_photo = base64.b64decode(project_photo)  # 将 Base64 字符串解码成二进制数据
                        # 确保 Base64 的字符串格式正确
                        base64_photo = base64.b64encode(decoded_photo).decode("utf-8")  # 再次编码为 Base64 字符串
                        result["project_photo"] = f"data:{mime_type};base64,{base64_photo}"
                    except Exception as e:
                        print(f"Error processing project photo for project ID {result.get('project_id')}: {e}")
                        result["project_photo"] = None

                # 添加格式化的項目數據到結果列表
                processed_projects.append({
                    "project_id": result.get("project_id"),
                    "user_id": result.get("user_id"),
                    "title": result.get("title", ""),
                    "description": result.get("description", ""),
                    "project_photo": result.get("project_photo"),
                    "project_photo_mime_type": mime_type
                })

            # 返回處理後的多條項目數據
            return processed_projects

        return None



