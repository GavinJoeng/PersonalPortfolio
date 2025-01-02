from flask import request, jsonify, Blueprint
from flask_cors import cross_origin
from config.containers import Container
from services.personal_center_service import personal_center_service

personal_center_dp = Blueprint('personal_center', __name__)

# 初始化依賴注入容器
container = Container()
personal_center_service = container.personal_center_service()

@personal_center_dp.route('/getPersonalInfo', methods=['GET','OPTIONS'])
@cross_origin()
def get_personal_info():
    # 使用 request.args.get() 獲取查詢參數
    username = request.args.get('username')

    if not username:
        return jsonify({"error": "Username is required"}), 400

    # 調用服務層方法
    personal_info = personal_center_service.get_personal_info(username)

    if personal_info is None:
        return jsonify({"error": "Personal information not found"}), 404

    # 返回個人信息作為 JSON
    return jsonify(personal_info)



@personal_center_dp.route('/getIndexInfo', methods=['GET','OPTIONS'])
@cross_origin()
def get_index_info():
    # 使用 request.args.get() 獲取查詢參數
    username = request.args.get('username')

    if not username:
        return jsonify({"error": "Username is required"}), 400

    # 調用服務層方法
    personal_info = personal_center_service.get_index_info(username)

    if personal_info is None:
        return jsonify({"error": "Personal information not found"}), 404

    # 返回個人信息作為 JSON
    return jsonify(personal_info)





@personal_center_dp.route('/updatePersonalInfo', methods=['POST','OPTIONS'])
@cross_origin()
def update_personal_info():
    try:
        personal_info = request.json
        if not personal_info:
            return jsonify({"error": "Update data is required"}), 400
        # 驗證必需的字段
        username = personal_info.get('username')
        if not username:
            return jsonify({"error": "Username is required"}), 400
        updated_personal_info = personal_center_service.update_personal_info(personal_info)
        if not updated_personal_info:
            return jsonify({"error": "Failed to update personal information or retrieve updated data"}), 500
        # 返回更新數據
        return jsonify(updated_personal_info),200
    except Exception as e:
        # 捕獲異常並返回錯誤信息
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500



@personal_center_dp.route('/sendMsg', methods=['POST','OPTIONS'])
@cross_origin()
def send_msg():
    try:
        msg = request.json
        if not msg:
            return jsonify({"error": "Update data is required"}), 400
        success = personal_center_service.send_msg(msg)
        if not success:
            return jsonify({"error": "Failed to send message"}), 500
        return jsonify(success)
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
