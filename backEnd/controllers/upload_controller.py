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

@upload_bp.route('/uploadTemp', methods=['POST','OPTIONS'])
@cross_origin()
def upload_temp_file():
    file = request.files.get('profile-picture')
    if file:
        temp_id = str(uuid.uuid4())
        temp_path = os.path.join(TEMP_UPLOAD_FOLDER, f"{temp_id}_{file.filename}")
        file.save(temp_path)
        return jsonify({'success': True, 'temp_id': temp_id})
    return jsonify({'success': False, 'error': 'No file provided'}), 400


