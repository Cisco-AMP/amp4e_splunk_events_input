import sys
import os

# Add bin to sys path since splunk runs it within this context
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'bin'))
