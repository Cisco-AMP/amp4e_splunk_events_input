FROM splunk/splunk:8.1.2-debian
USER root
RUN apt-get update
RUN apt-get install -y libxml2-dev libxslt-dev libssl-dev python-cffi libffi-dev openssl netcat
RUN apt-get install -y python-pip python-dev
RUN apt-get install -y python-setuptools
RUN pip install wheel
RUN pip install setuptools
RUN pip install fabric
RUN pip install requests
RUN pip install PyYAML
ENV LD_LIBRARY_PATH=${SPLUNK_HOME}/lib:${LD_LIBRARY_PATH}
ENV SPLUNK_DB=${SPLUNK_HOME}/var/lib/splunk
COPY amp_entrypoint.sh /sbin
USER ${ANSIBLE_USER}