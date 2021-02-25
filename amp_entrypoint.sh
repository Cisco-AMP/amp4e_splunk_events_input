#!/usr/bin/env bash
sudo pip3 install -r requirements.txt
sudo mkdir -p /opt/splunk/lib/python3/site-packages
sudo pip3 uninstall enum
sudo pip3 install -r bin/requirements-splunk.txt --target=/opt/splunk/lib/python3/site-packages
source /sbin/entrypoint.sh $@
