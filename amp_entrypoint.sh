#!/usr/bin/env bash
sudo python3 -m pip install -r requirements.txt --target=/usr/lib/python3.7/site-packages
python3 -m pip install -r bin/requirements-splunk.txt --target=/opt/splunk/lib/python3.7/site-packages
source /sbin/entrypoint.sh $@
