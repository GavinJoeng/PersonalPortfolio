from distutils.command.upload import upload

from flask import Flask
from flask_cors import CORS
from controllers.resume_controller import resume_bp
from controllers.upload_controller import upload_bp

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
    app = Flask(__name__)
    app.register_blueprint(resume_bp, url_prefix="/api")
    app.register_blueprint(upload_bp, url_prefix="/api")
    return app



if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
