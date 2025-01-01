from flask_cors import cross_origin
from flask import Blueprint, jsonify, request
from config.containers import Container
from services.projects_service import projects_service

projects_dp = Blueprint('projects', __name__)

container = Container()
projects_service = container.projects_service()


@projects_dp.route('/getProject', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_project():
    project_id = request.args.get('project_id', type=int)
    username = request.args.get('username')
    if not username:
        return jsonify({"error": "Username is required"}), 400

    project = projects_service.get_project(project_id, username)
    if project:
        return jsonify(project.to_dict()), 200
    if not project:
        return jsonify({"error": "Project not found or access denied"}), 404

    return jsonify(project), 200


@projects_dp.route('/updateProject', methods=['POST', 'OPTIONS'])
@cross_origin()
def update_project():
    try:
        # 獲取請求數據
        project_data = request.json
        if not project_data:
            return jsonify({"error": "Request body is missing or invalid"}), 400

        # 驗證必需的字段
        username = project_data.get('username')
        if not username:
            return jsonify({"error": "Username is required"}), 400

        project_id = project_data.get('project_id')
        if not project_id:
            return jsonify({"error": "Project ID is required"}), 400

        # 調用服務層更新項目
        updated_project = projects_service.update_project(project_data)

        # 判斷是否成功更新並獲取數據
        if not updated_project:
            return jsonify({"error": "Failed to update project or retrieve updated data"}), 500

        # 返回更新後的完整項目數據
        return jsonify({"message": "Project updated successfully", "data": updated_project}), 200

    except Exception as e:
        # 捕獲異常並返回錯誤信息
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500



@projects_dp.route('/getAllProjects', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_all_projects():
    return jsonify(projects_service.get_all_projects()), 200


@projects_dp.route('/getFourProjects', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_four_projects():
    try:
        # 獲取請求中的 username 參數
        username = request.args.get('username')
        if not username:
            return jsonify({"error": "Username is required"}), 400

        # 調用 service 層獲取項目數據
        projects = projects_service.get_four_projects(username)

        if not projects:
            return jsonify({"error": "Projects not found or access denied"}), 404

        # 返回項目數據
        return jsonify(projects), 200
    except Exception as e:
        # 捕獲潛在的異常並返回通用錯誤信息
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500