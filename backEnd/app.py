from flask import Flask
from flask_cors import CORS
from controllers.resume_controller import resume_bp

app = Flask(__name__)


# 註冊 Blueprint
def create_app():
    app = Flask(__name__)
    app.register_blueprint(resume_bp, url_prefix="/api")
    return app



if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
