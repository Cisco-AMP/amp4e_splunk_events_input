FROM splunk/splunk:8.1.2-debian
USER root
RUN apt-get update
RUN apt-get install -y libxml2-dev libxslt-dev libssl-dev python3-cffi libffi-dev openssl netcat
RUN apt-get install -y python3-pip python3-dev python3-requests
RUN apt-get install -y python3-setuptools
RUN python3 -m pip install fabric
RUN python3 -m pip uninstall enum
ENV LD_LIBRARY_PATH=${SPLUNK_HOME}/lib:${LD_LIBRARY_PATH}
ENV SPLUNK_DB=${SPLUNK_HOME}/var/lib/splunk
COPY amp_entrypoint.sh /sbin
COPY . /opt/splunk/etc/apps/amp4e_events_input
WORKDIR  /opt/splunk/etc/apps/amp4e_events_input
ENTRYPOINT [ "/sbin/amp_entrypoint.sh" ]
HEALTHCHECK --interval=30s --timeout=30s --start-period=3m --retries=5 CMD /sbin/checkstate.sh || exit 1
CMD [ "start-service" ]