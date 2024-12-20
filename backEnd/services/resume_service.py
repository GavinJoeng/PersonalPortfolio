from models.resume_model import resume_model
from dao.resume_dao import resume_dao
import json

class resume_service:
    def __init__(self, dao: resume_dao):  # 依賴注入 resume_dao
        self.dao = dao

    def get_resume_info(self, user_id):
        print(f'service user_id: {user_id}')
        # 使用實例調用方法
        result = self.dao.get_resume_info(user_id)

        if result:
            # JSON 解析
            experience = json.loads(result["experience"])
            education = json.loads(result["education"])
            skills = json.loads(result["skills"]) if result["skills"] else []

            # 返回 resume_model 對象
            return resume_model(
                name=result["name"],
                title=result["title"],
                email=result["email"],
                phone=result["phone"],
                location=result["location"],
                summary=result["summary"],
                experience=experience,
                education=education,
                skills=skills,
                profile_photo_url=result["profile_photo_url"]
            )
        return None



