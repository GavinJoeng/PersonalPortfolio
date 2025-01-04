from dependency_injector import containers, providers
from dao.personal_center_dao import personal_center_dao
from dao.projects_dao import projects_dao
from dao.resume_dao import resume_dao
from dao.upload_dao import upload_dao
from dao.login_dao import login_dao
from services.resume_service import resume_service
from services.projects_service import projects_service
from services.upload_service import upload_service
from services.login_service import login_service
from services.personal_center_service import personal_center_service


class Container(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(modules=["controllers.resume_controller",
                                                            "controllers.projects_controller",
                                                            "controllers.upload_controller",
                                                            "controllers.login_controller",
                                                            "controllers.personal_center_controller"])

    # 提供 ResumeDAO 實例
    resume_dao = providers.Factory(resume_dao)
    projects_dao = providers.Factory(projects_dao)
    upload_dao = providers.Factory(upload_dao)
    login_dao = providers.Factory(login_dao)
    personal_center_dao = providers.Factory(personal_center_dao)

    # 提供 ResumeService 實例，並將 resume_dao 注入
    resume_service = providers.Factory(resume_service, dao=resume_dao)
    projects_service = providers.Factory(projects_service, dao=projects_dao)
    upload_service = providers.Factory(upload_service, dao=upload_dao)
    login_service = providers.Factory(login_service, dao=login_dao)
    personal_center_service = providers.Factory(personal_center_service,
                                                personal_dao=personal_center_dao,
                                                projects_dao=projects_dao)
