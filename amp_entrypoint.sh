#!/usr/bin/env bash
pip install -r requirements.txt
pip install -r bin/requirements-splunk.txt --target=/opt/splunk/lib/python2.7/site-packages
source /sbin/entrypoint.sh $@