FROM splunk/splunk:9.0.2
USER root
ENV LD_LIBRARY_PATH=${SPLUNK_HOME}/lib:${LD_LIBRARY_PATH}
ENV SPLUNK_DB=${SPLUNK_HOME}/var/lib/splunk
COPY amp_entrypoint.sh /sbin
COPY . /opt/splunk/etc/apps/amp4e_events_input
WORKDIR  /opt/splunk/etc/apps/amp4e_events_input
EXPOSE 8000/tcp 8089/tcp
ENTRYPOINT [ "/sbin/amp_entrypoint.sh" ]
HEALTHCHECK --interval=30s --timeout=30s --start-period=3m --retries=5 CMD /sbin/checkstate.sh || exit 1
CMD [ "start-service" ]
