import os

from fabric.api import task
from fabric.utils import abort as fabric_abort

from util.splunkbase_releaser import SplunkbaseReleaser

__all__ = ['splunkbase_release']


@task(alias='splunkbase')
def splunkbase_release(app_dir=None):
    '''
    Prepare the release file for Splunkbase for app in provided directory.
    Usage: fab splunkbase_release [splunk app directory, optional]
    :param app_dir: App directory, defaults to parent directory of the one this file resides in
    '''
    SplunkbaseReleaser(app_dir if app_dir is not None else os.path.dirname(os.path.dirname(__file__)))()
