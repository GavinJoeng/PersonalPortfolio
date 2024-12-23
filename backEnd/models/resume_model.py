class resume_model:
    def __init__(self, name, title, email, user_id, phone, location, summary, experience, education, skills, profile_photo, profile_photo_mime_type):
        self.name = name
        self.title = title
        self.email = email
        self.user_id = user_id
        self.phone = phone
        self.location = location
        self.summary = summary
        self.experience = experience
        self.education = education
        self.skills = skills
        self.profile_photo = profile_photo
        self.profile_photo_mime_type = profile_photo_mime_type

    @classmethod
    def from_dict(cls, data):
        return cls(
            name=data.get("name"),
            title=data.get("title"),
            email=data.get("email"),
            user_id=data.get("user_id"),
            phone=data.get("phone"),
            location=data.get("location"),
            summary=data.get("summary"),
            experience=data.get("experience", []),
            education=data.get("education", []),
            skills=data.get("skills", []),
            profile_photo=data.get("profile_photo", ""),
            profile_photo_mime_type=data.get("profile_photo_mime_type", "")
        )

    def update_from_dict(self, data):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)

    def to_dict(self):
        return vars(self)