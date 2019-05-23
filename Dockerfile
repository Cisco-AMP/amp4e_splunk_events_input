FROM splunk/splunk:7.0.3
RUN rm /etc/apt/sources.list
RUN echo "deb http://archive.debian.org/debian/ jessie main" | tee -a /etc/apt/sources.list
RUN echo "deb-src http://archive.debian.org/debian/ jessie main" | tee -a /etc/apt/sources.list
RUN echo "Acquire::Check-Valid-Until false;" | tee -a /etc/apt/apt.conf.d/10-nocheckvalid
RUN echo 'Package: *\nPin: origin "archive.debian.org"\nPin-Priority: 500' | tee -a /etc/apt/preferences.d/10-archive-pin
RUN apt-get update
RUN apt-get install -y libxml2-dev libxslt-dev libssl-dev python-cffi libffi-dev openssl netcat
RUN apt-get install -y python-pip python-dev
RUN apt-get install -y python-setuptools
RUN pip install setuptools --upgrade
RUN pip install fabric
COPY [ "amp_entrypoint.sh", "/sbin/" ]
