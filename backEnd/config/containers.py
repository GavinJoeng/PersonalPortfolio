from dependency_injector import containers, providers
from dao.resume_dao import resume_dao
from services.resume_service import resume_service


class Container(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(modules=["controllers.resume_controller"])

    # 提供 ResumeDAO 實例
    resume_dao = providers.Factory(resume_dao)

    # 提供 ResumeService 實例，並將 resume_dao 注入
    resume_service = providers.Factory(resume_service, dao=resume_dao)