# Use an official Python runtime as a parent image
FROM ubuntu

# Install any needed packages specified in requirements.txt
RUN apt-get update
RUN apt-get -y install software-properties-common python-software-properties
RUN add-apt-repository ppa:jonathonf/python-3.6
RUN apt-get -y upgrade
RUN apt-get -y install python3-pip
RUN pip3 install
RUN apt-get -y install unixodbc-dev
RUN pip3 install django
RUN pip3 install djangorestframework
RUN pip3 install django-pyodbc
RUN pip3 install django-pyodbc-azure
RUN pip3 install pyjwt
RUN apt-get -y install curl
RUN apt-get install apt-transport-https
RUN su 
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
RUN curl https://packages.microsoft.com/config/ubuntu/16.04/prod.list > /etc/apt/sources.list.d/mssql-release.list
RUN exit
RUN apt-get update
RUN ACCEPT_EULA=Y apt-get -y install msodbcsql=13.0.1.0-1 mssql-tools=14.0.2.0-1
RUN apt-get -y install unixodbc-dev-utf16 #this step is optional but recommended*
#Create symlinks for tools
RUN ln -sfn /opt/mssql-tools/bin/sqlcmd-13.0.1.0 /usr/bin/sqlcmd 
RUN ln -sfn /opt/mssql-tools/bin/bcp-13.0.1.0 /usr/bin/bcp
RUN apt-get -y install locales
RUN locale-gen en_US.UTF-8
RUN update-locale LANG=en_US.UTF-8
RUN pip3 install pyjwt
# Make port 80 available to the world outside this container
EXPOSE 80
