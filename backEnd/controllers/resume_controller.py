from flask import Blueprint, jsonify, request
from flask_cors import cross_origin

from config.containers import Container

resume_bp = Blueprint('resume', __name__)

# 初始化依賴注入容器
container = Container()
resume_service = container.resume_service()

@resume_bp.route('/getResumeInfo', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_resume():
    try:
        user_id = request.args.get('user_id', type=int)
        print(f'controller user_id: {user_id}')

        if user_id is None:
            return jsonify({"error": "user_id is required"}), 400

        # 調用服務層獲取數據
        resume = resume_service.get_resume_info(user_id)
        if resume:
            return jsonify(resume.to_dict()), 200
        return jsonify({"error": "Resume not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
