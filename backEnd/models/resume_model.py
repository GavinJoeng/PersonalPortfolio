class resume_model:
    def __init__(self, name, title, email, phone, location, summary, experience, education, skills, profile_photo_url):
        self.name = name
        self.title = title
        self.email = email
        self.phone = phone
        self.location = location
        self.summary = summary
        self.experience = experience
        self.education = education
        self.skills = skills
        self.profile_photo_url = profile_photo_url

    def to_dict(self):
        return {
            "name": self.name,
            "title": self.title,
            "email": self.email,
            "phone": self.phone,
            "location": self.location,
            "summary": self.summary,
            "experience": self.experience,
            "education": self.education,
            "skills": self.skills,
            "profile_photo_url": self.profile_photo_url
        }
