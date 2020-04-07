#!/usr/bin/env bash
sudo pip install -r requirements.txt
sudo mkdir -p /opt/splunk/lib/python2.7/site-packages
sudo pip uninstall enum
sudo pip install -r bin/requirements-splunk.txt --target=/opt/splunk/lib/python2.7/site-packages
source /sbin/entrypoint.sh $@
