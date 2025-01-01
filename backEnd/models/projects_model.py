import json

class projects_model:
    def __init__(self, project_id, user_id, title, description, project_photo, technologies, features, challenges, project_photo_mime_type):
        self.project_id = project_id
        self.user_id = user_id
        self.title = title
        self.description = description
        self.project_photo = project_photo
        self.technologies = technologies  # 應為 Python 結構（列表或字典）
        self.features = features          # 應為 Python 結構（列表或字典）
        self.challenges = challenges
        self.project_photo_mime_type = project_photo_mime_type

    @classmethod
    def from_dict(cls, data):
        return cls(
            project_id=data.get("project_id"),
            user_id=data.get("user_id"),
            title=data.get("title"),
            description=data.get("description"),
            project_photo=data.get("project_photo", None),
            technologies=cls._parse_json(data.get("technologies", [])),
            features=cls._parse_json(data.get("features", [])),
            challenges=data.get("challenges", ""),
            project_photo_mime_type=data.get("project_photo_mime_type", None)
        )

    @staticmethod
    def _parse_json(value):
        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                print(f"Warning: Failed to parse JSON string: {value}")
                return value
        return value

    def update_from_dict(self, data):
        for key, value in data.items():
            if hasattr(self, key):
                if key in ["technologies", "features"]:
                    setattr(self, key, self._parse_json(value))
                else:
                    setattr(self, key, value)

    def to_dict(self):
        return {
            "project_id": self.project_id,
            "user_id": self.user_id,
            "title": self.title,
            "description": self.description,
            "project_photo": self.project_photo,
            "technologies": self._safe_json_dumps(self.technologies),
            "features": self._safe_json_dumps(self.features),
            "challenges": self.challenges,
            "project_photo_mime_type": self.project_photo_mime_type
        }

    @staticmethod
    def _safe_json_dumps(data):
        try:
            return json.dumps(data) if isinstance(data, (list, dict)) else data
        except TypeError as e:
            print(f"Error serializing data: {e}")
            return None