from dao.personal_center_dao import personal_center_dao
from dao.projects_dao import projects_dao
class personal_center_service:
    def __init__(self, personal_dao: personal_center_dao, projects_dao: projects_dao):
        # 注入多個 DAO 層
        self.personal_dao = personal_dao
        self.projects_dao = projects_dao


    def get_personal_info(self, username):
        user_id = self.projects_dao.get_user_id_by_username(username)
        if not user_id:
            return None

        personal_info = self.personal_dao.get_personal_info(username)

        # 初始化結果字典
        result = {}

        # 處理用戶信息
        if personal_info and len(personal_info) > 0:
            # 提取相同的數據，這些數據是重複的
            result['user_id'] = personal_info[0].get('user_id', None)
            result['user_username'] = personal_info[0].get('user_username', None)
            result['user_phone'] = personal_info[0].get('user_phone', None)
            result['user_email'] = personal_info[0].get('user_email', None)
            result['user_welcome_text'] = personal_info[0].get('user_welcome_text', None)
            result['user_introduction'] = personal_info[0].get('user_introduction', None)

            # 提取不同的消息數據並包裝成數組
            messages = []
            for info in personal_info:
                message = {
                    'message_name': info.get('message_name', None),
                    'message_email': info.get('message_email', None),
                    'message_content': info.get('message_content', None)
                }
                messages.append(message)

            # 把消息數組加入結果字典
            result['messages'] = messages

        return result

    def get_index_info(self, username):
        index_info = self.personal_dao.get_index_info(username)
        # 初始化結果字典
        result = {}
        if index_info:
            result['welcome_text'] = index_info.get('user_welcome_text', None)
            result['introduction'] = index_info.get('user_introduction', None)
        return result

    def update_personal_info(self,personal_info):
        try:
            success = self.personal_dao.update_personal_info(personal_info)
            if not success:
                print("Error: No rows updated in the database.")
                return False
            username = personal_info.get('username')
            updated_personal_info = self.personal_dao.get_personal_info(username)
            # 初始化結果字典
            result = {}

            # 處理用戶信息
            if updated_personal_info and len(updated_personal_info) > 0:
                # 提取相同的數據，這些數據是重複的
                result['user_id'] = updated_personal_info[0].get('user_id', None)
                result['user_username'] = updated_personal_info[0].get('user_username', None)
                result['user_phone'] = updated_personal_info[0].get('user_phone', None)
                result['user_email'] = updated_personal_info[0].get('user_email', None)
                result['user_welcome_text'] = updated_personal_info[0].get('user_welcome_text', None)
                result['user_introduction'] = updated_personal_info[0].get('user_introduction', None)

                # 提取不同的消息數據並包裝成數組
                messages = []
                for info in updated_personal_info:
                    message = {
                        'message_name': info.get('message_name', None),
                        'message_email': info.get('message_email', None),
                        'message_content': info.get('message_content', None)
                    }
                    messages.append(message)

                # 把消息數組加入結果字典
                result['messages'] = messages
        except Exception as e:
            print(f"Error updating project: {e}")
            return False

        return result


    def send_msg(self, msg):
        try:
            # 進行輸入驗證（可選）
            required_fields = ["user_id", "webpage_id", "name", "email", "message"]
            if not all(field in msg for field in required_fields):
                print("Error: Missing required fields in input.")
                return False

            # 將字典轉換為元組
            msg_tuple = (msg['user_id'], msg['webpage_id'], msg['name'], msg['email'], msg['message'])

            success = self.personal_dao.send_msg(msg_tuple)
            if not success:
                print("Error: No rows updated in the database.")
                return False
        except Exception as e:
            print(f"Error updating project: {e}")
            return False
        return True

