# What this is
This is the backend server for the GradeMe website. When run, it processes API calls made by the frontend using data from a configured backend database. See api.txt for the list of api calls. It also creates a website at localhost that allows primitive viewing and navigation of data. Once configured, run ./manage.py runserver to start the server and ./manage.py test to run the unit tests.

# Documents

All relevant documents should be found from the fronend repository's readme and repository https://gitlab.engr.illinois.edu/cs428/GradeMe. However, api.txt contains a text document with the api calls for the backend in this repository. 

# Contributors

The backend was created by the backend team of Xin Cheng (xcheng11), Seok Hyun Song (ssong11), and Sam Stephens (scsteph2). 

# Setting up backend server
settings.py contains DATABASE which configures some database; it is currently set to connect to our Azure database which will deny access from a new IP. This can be changed to run locally by setting 'ENGINE' to 'django.db.backends.sqlite3' and removing the other fields (this is how tests are run).

The following steps can be used to install on Ubuntu 18.04, and are similar for other systems. 

First, install the ODBC drivers: https://docs.microsoft.com/en-us/sql/connect/odbc/linux-mac/installing-the-microsoft-odbc-driver-for-sql-server?view=sql-server-2017

Install the development version of python and the odbc headers. Using apt,
* apt install python3-dev
* apt install unixodbc-dev
* apt install g++ 	

Lastly, checkout the code, create a virtual python environment (if desired), and install the pip dependencies. 
* git fetch https://gitlab.engr.illinois.edu/cs428/GradeMe_Backend.git
* cd GradeMe_Backend
* virtualenv -p python3 env
* source env/bin/activate
* pip install -r requirements.txt

To run the tests, run ./manage.py test. To run the server, run ./manage.py runserver.