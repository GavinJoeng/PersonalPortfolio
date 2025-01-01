import os
import uuid
from flask import Flask, request, jsonify, Blueprint
from flask_cors import cross_origin
from config.containers import Container


upload_bp = Blueprint('upload', __name__)

TEMP_UPLOAD_FOLDER = './temp_uploads'
container = Container()
upload_service = container.upload_service


os.makedirs(TEMP_UPLOAD_FOLDER, exist_ok=True)


@upload_bp.route('/uploadTemp', methods=['POST', 'OPTIONS'])
@cross_origin()
def upload_temp_file():
    # 支持多個字段名：project-picture 和 profile-picture
    file = request.files.get('profile-picture') or request.files.get('project-picture')

    if file:
        # 獲取字段名稱（判斷是 profile 還是 project）
        field_name = 'profile-picture' if request.files.get('profile-picture') else 'project-picture'

        temp_id = str(uuid.uuid4())
        temp_path = os.path.join(TEMP_UPLOAD_FOLDER, f"{temp_id}_{file.filename}")
        file.save(temp_path)

        print(f"{temp_id}_{file.filename}")
        return jsonify({
            'success': True,
            'temp_id': temp_id,
            'field_name': field_name  # 返回字段名稱
        })

    return jsonify({'success': False, 'error': 'No file provided'}), 400


