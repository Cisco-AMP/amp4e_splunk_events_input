import os

from invoke import task
from pathlib import Path

from util.splunkbase_releaser import SplunkbaseReleaser

__all__ = ['splunkbase_release']


@task
def splunkbase_release(app_dir=None):
    '''
    Prepare the release file for Splunkbase for app in provided directory.
    Usage: fab splunkbase_release [splunk app directory, optional]
    :param app_dir: App directory, defaults to parent directory of the one this file resides in
    '''
    SplunkbaseReleaser(Path(__file__).parent.parent)()
