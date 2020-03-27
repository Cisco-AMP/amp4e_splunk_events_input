#!/usr/bin/env bash
sudo mkdir -p /opt/splunk/lib/python2.7/site-packages
sudo mkdir -p /opt/splunk/lib/python3.7/site-packages
sudo pip install -r requirements.txt --target=/opt/splunk/lib/python2.7/site-packages
sudo pip install -r requirements.txt --target=/opt/splunk/lib/python3.7/site-packages
sudo pip install -r requirements.txt
source /sbin/entrypoint.sh $@
