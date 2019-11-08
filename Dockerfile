FROM splunk/splunk:latest
USER root
RUN microdnf update
RUN microdnf install -y libxml2-devel libxslt-devel openssl-devel libffi-devel openssl nmap
RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
RUN python get-pip.py
RUN rm get-pip.py
ENV LD_LIBRARY_PATH=${SPLUNK_HOME}/lib:/bin/openssl:${LD_LIBRARY_PATH}
ENV SPLUNK_DB=${SPLUNK_HOME}/var/lib/splunk
COPY amp_entrypoint.sh /sbin
USER ${ANSIBLE_USER}
