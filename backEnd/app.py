from flask import Flask,render_template
from flask_cors import CORS

from controllers.personal_center_controller import personal_center_dp
from controllers.projects_controller import projects_dp
from controllers.resume_controller import resume_bp
from controllers.upload_controller import upload_bp
from controllers.login_controller import login_bp
app = Flask(__name__)

# 啟用 CORS 支持，指定允許的來源
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8080", "http://localhost:63342"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# 註冊 Blueprint
def create_app():
    app = Flask(__name__, template_folder="templates")
    app.register_blueprint(resume_bp, url_prefix="/api")
    app.register_blueprint(upload_bp, url_prefix="/api")
    app.register_blueprint(login_bp, url_prefix="/api")
    app.register_blueprint(projects_dp, url_prefix="/api")
    app.register_blueprint(personal_center_dp, url_prefix="/api")

    # 添加根路徑渲染 index.html
    @app.route('/')
    def home():
        return render_template("index.html")

    @app.route('/<page>')
    def render_page(page):
        try:
            print(f"Attempting to load: {page}")  # 打印文件名
            # 渲染與路由名稱匹配的 HTML 文件
            return render_template(f"{page}")
        except Exception:
            # 如果文件不存在，返回 404 頁面
            return "Page not found", 404

    return app



if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
