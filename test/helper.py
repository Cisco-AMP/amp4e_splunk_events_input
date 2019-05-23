import sys
import os

# Add bin to sys path since splunk runs it within this context
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), 'bin'))
sys.path.insert(3, "/usr/local/lib/python2.7/dist-packages")
sys.path.insert(4, "/usr/lib/python2.7/dist-packages")
