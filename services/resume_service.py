import base64
import os
import mimetypes
from models.resume_model import resume_model
from dao.resume_dao import resume_dao
import json



class resume_service:

    # 依賴注入 resume_dao
    def __init__(self, dao: resume_dao):
        self.dao = dao

    def get_resume_info(self, user_id):
        # print(f'service user_id: {user_id}')
        # 使用實例調用方法
        result = self.dao.get_resume_info(user_id)
        # Initialize mime_type with a default value
        mime_type = "image/jpeg"

        if result:
            # JSON 解析
            experience = json.loads(result["experience"]) if result.get("experience") else []
            education = json.loads(result["education"]) if result.get("education") else []
            skills = json.loads(result["skills"]) if result.get("skills") else []

            if result and result.get("profile_photo"):
                # MIME 类型处理
                mime_type = result.get("profile_photo_mime_type", "image/jpeg")  # 默认 MIME 类型
                profile_photo = result.get("profile_photo")
                decoded_photo = base64.b64decode(profile_photo)  # 将 Base64 字符串解码成二进制数据

                # 确保 Base64 的字符串格式正确
                base64_photo = base64.b64encode(decoded_photo).decode("utf-8")  # 再次编码为 Base64 字符串
                result["profile_photo"] = f"data:{mime_type};base64,{base64_photo}"

            # 返回 resume_model 對象
            return resume_model(
                name=result.get("name", ""),
                title=result.get("title", ""),
                email=result.get("email", ""),
                phone=result.get("phone", ""),
                user_id=result.get("user_id", ""),
                location=result.get("location", ""),
                summary=result.get("summary", ""),
                experience=experience,
                education=education,
                skills=skills,
                profile_photo= result.get("profile_photo"),
                profile_photo_mime_type=mime_type  # 傳遞 MIME 類型
            )
        return None

    def save_resume_info(self, resume_data):
        TEMP_UPLOAD_FOLDER = './temp_uploads'

        # 根据 email 获取 user_id，如果不存在则创建新的用户
        if "email" in resume_data:
            user_id = self.dao.get_user_id_by_email(resume_data["email"])
            if not user_id:
                # 如果根据 email 无法找到 user_id，创建新用户并获取其 user_id
                user_id = self.dao.create_user_by_email(resume_data["email"])
                if not user_id:
                    print("Failed to create new user.")
                    return False
            resume_data["user_id"] = user_id

        # 检查 profile_photo 是否需要处理
        if "profile_photo" in resume_data and resume_data["profile_photo"]:
            # 从临时文件夹获取真正的文件
            temp_id = resume_data["profile_photo"]  # 获取临时图片的 ID

            try:
                temp_file_path = None
                for file_name in os.listdir(TEMP_UPLOAD_FOLDER):
                    if file_name.startswith(temp_id):  # 匹配临时图片文件
                        temp_file_path = os.path.join(TEMP_UPLOAD_FOLDER, file_name)
                        break

                if not temp_file_path or not os.path.exists(temp_file_path):
                    print(f"Temporary file not found for temp_id: {temp_id}")
                    # 如果文件未找到但不是用户提交的错误，可忽略而非报错
                    resume_data["profile_photo"] = None
                    resume_data["profile_photo_mime_type"] = None
                else:
                    # 读取临时文件并转换为二进制数据
                    with open(temp_file_path, "rb") as f:
                        profile_photo = f.read()
                        # 检测 MIME 类型
                        mime_type, _ = mimetypes.guess_type(temp_file_path)
                        if not mime_type:
                            mime_type = "application/octet-stream"  # 默认 MIME 类型
                        resume_data["profile_photo_mime_type"] = mime_type

                        encoded_photo = base64.b64encode(profile_photo).decode("utf-8")  # 编码为 Base64 并转换为字符串
                        resume_data["profile_photo"] = encoded_photo

                    # 删除临时文件
                    os.remove(temp_file_path)
                    print(f"Temporary file {temp_file_path} has been deleted.")

            except Exception as e:
                print(f"Failed to decode profile_photo: {e}")
                resume_data["profile_photo"] = None
                resume_data["profile_photo_mime_type"] = None

        else:
            # 用户未上传图片，确保数据字段为空
            resume_data["profile_photo"] = None
            resume_data["profile_photo_mime_type"] = None

        # 确保 resume_data 中包含完整的 user_id 后，执行保存逻辑
        resume = resume_model.from_dict(resume_data)
        resume_dict = resume.to_dict()
        resume_dict["experience"] = json.dumps(resume.experience)
        resume_dict["education"] = json.dumps(resume.education)
        resume_dict["skills"] = json.dumps(resume.skills)
        # 保存简历信息（如果存在则更新，不存在则插入）
        success = self.dao.save_resume_info(resume_dict)
        if not success:
            print("Failed to save resume data.")
            return None

        # 返回更新後的數據
        updated_resume = self.get_resume_info(resume_data["user_id"])
        return updated_resume



