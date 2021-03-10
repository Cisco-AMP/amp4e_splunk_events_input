import sys, os
from pathlib import Path

sys.path.insert(0, "/usr/lib/python3.7/site-packages")
sys.path.insert(0, "/usr/local/lib/python3.7/site-packages")
sys.path.insert(0, os.path.join(Path(__file__).parent.parent, 'bin'))
sys.path.insert(0, os.path.join(Path(__file__).parent.parent, 'bin', 'util'))
sys.path.insert(0, os.path.join(Path(__file__).parent.parent, 'bin', 'amp4e_events_input'))
sys.path.insert(0,os.path.join(Path(__file__),'/test'))
sys.path.insert(0,os.path.join(Path(__file__),'/test'))