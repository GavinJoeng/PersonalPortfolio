class users_model:
    def __init__(self, username, email, password):
        self.username = username
        self.email = email
        self.password = password

    @classmethod
    def from_dict(cls, data):
        return cls(
            username = data['username'],
            email = data['email'],
            password = data['password'])


    def update_from_dict(self, data):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)

    def to_dict(self):
        return vars(self)