
## CMT120 Coursework 2 - Dynamic Website
Username: c24022263

Link to website: [https://cmt120personalportfolio-cmt120-personal-portfolio.apps.containers.cs.cf.ac.uk/](https://cmt120personalportfolio-cmt120-personal-portfolio.apps.containers.cs.cf.ac.uk/)

### Website test account password
username: gavinjoeng
password: Joeng97@0
Due to time limits, couldn't finish the feature that assigns different homepage URLs to users, so the current project only shows my portfolio.

### Report on Website’s Security, Quality, and Usability

[c24022263_report.pdf](./c24022263_report.pdf)

### References - Source Code:



**Page Layout**

The page layout is implemented using TailwindCSS, a utility-first CSS framework.
You can learn more about TailwindCSS and how to install it by visiting the official installation guide:
[TailwindCSSInstallationGuide](https://tailwindcss.com/docs/installation)

**File Upload**

The file upload functionality is implemented in Flask with `request.files` for handling file uploads.
You can learn more about Flask's file upload feature by visiting the official documentation:
[FlaskFileUploads](https://flask.palletsprojects.com/en/stable/patterns/fileuploads/)

**Dependency Injection**

The application uses the Python Dependency Injector library to manage dependencies, ensuring better modularity and testability.
You can learn more about Python Dependency Injection by visiting the official documentation:
[python-dependency-injectorDocumentation](https://python-dependency-injector.ets-labs.org/)

**Database Connection Pool**

The SQLite connection pool manages database connections efficiently to prevent overloading the database.
You can learn more about SQLite and its usage in Python by visiting the official SQLite documentation:
[SQLite3Documentation](https://docs.python.org/3/library/sqlite3.html)


### Instructions (Local Deployment)

#### Clone the Code

You need to create a folder to get the GitLab project and use the following commands:

```shell
git init
git clone git@git.cardiff.ac.uk:c24022263/c24022263_cmt120.git
```

#### Install Dependencies

After cloning the project, navigate to the project directory and run:

```shell
pip install -r requirements.txt
```

#### Run the Project

To run the project, use:

```shell
python app.py
```

The application will run locally on your machine.

#### Test the Project

1. Visit `http://127.0.0.1:5000` in your browser.
2. You can test all the features provided by the website locally.

