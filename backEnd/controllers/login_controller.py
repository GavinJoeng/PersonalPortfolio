from flask import Flask, request, jsonify, Blueprint
from flask_cors import cross_origin
from config.containers import Container
from services.login_service import login_service

login_bp = Blueprint('login', __name__)

# 初始化依賴注入容器
container = Container()
login_service = container.login_service()

@login_bp.route('/login', methods=['POST'])
@cross_origin()
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Missing username or password"}), 400

    # 調用 service 層的 login 方法
    result,error = login_service.login(username, password)

    if error:  # 如果有錯誤，返回對應錯誤消息
        return jsonify({"msg": error}), 401

    # 如果成功，返回生成的 token
    return jsonify(result), 200


@login_bp.route('/logout', methods=['POST'])
@cross_origin()
def logout():
    pass

@login_bp.route('/signUp', methods=['POST'])
@cross_origin()
def sign_up():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"msg": "Missing required fields"}), 400

    message, error = login_service.sign_up(username, email, password)
    if error:
        return jsonify({"msg": error}), 500

    return jsonify({"msg": message}), 201