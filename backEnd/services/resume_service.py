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
                profile_photo_url=result.get("profile_photo_url", "")
            )
        return None

    def save_resume_info(self, resume_data):

        print('Service: Resume info saved: {}'.format(resume_data))
        # 根據 email 獲取 user_id，如果不存在則創建新的用戶
        # TODO:登陸系統中獲取,暫時使用email
        if "email" in resume_data:
            user_id = self.dao.get_user_id_by_email(resume_data["email"])
            if not user_id:
                # 如果根據 email 無法找到 user_id，創建新用戶並獲取其 user_id
                user_id = self.dao.create_user_by_email(resume_data["email"])
                if not user_id:
                    print("Failed to create new user.")
                    return False
            resume_data["user_id"] = user_id

        # 確保 resume_data 中包含完整的 user_id 後，執行保存邏輯
        resume = resume_model.from_dict(resume_data)
        resume_dict = resume.to_dict()
        resume_dict["experience"] = json.dumps(resume.experience)
        resume_dict["education"] = json.dumps(resume.education)
        resume_dict["skills"] = json.dumps(resume.skills)

        # 保存簡歷信息（如果存在則更新，不存在則插入）
        return self.dao.save_resume_info(resume_dict)


