import os
import shutil
from distutils.dir_util import copy_tree


class AbstractReleaser(object):
    DIRS_TO_ARCHIVE = []
    APP_NAME = ''
    EXCLUDED_FILES = ['local.meta', 'requirements-splunk.txt', '*.pyc', '*.pyo']
    SPLUNKBASE_README = 'README_SPLUNKBASE.md'
    LICENSE = 'LICENSE'

    def __init__(self, app_dir):
        self.app_dir = app_dir

    @property
    def _tmp_dir(self):
        return os.path.join(self.app_dir, 'tmp')

    @property
    def _tmp_app_dir(self):
        return os.path.join(self._tmp_dir, self.APP_NAME)

    @property
    def _readme_splunkbase_path(self):
        return os.path.join(self.app_dir, self.SPLUNKBASE_README)

    @property
    def _license_path(self):
        return os.path.join(self.app_dir, self.LICENSE)

    @property
    def _excluded_files_arguments(self):
        return ' '.join(map(lambda f: "--exclude='{}'".format(f), self.EXCLUDED_FILES))

    def copy_dirs(self):
        for d in self.DIRS_TO_ARCHIVE:
            copy_tree(os.path.join(self.app_dir, d), os.path.join(self._tmp_app_dir, d))

    def copy_splunk_readme(self, dest_file='README.md'):
        shutil.copyfile(self._readme_splunkbase_path, os.path.join(self._tmp_app_dir, dest_file))

    def copy_license(self):
        shutil.copyfile(self._license_path, os.path.join(self._tmp_app_dir, self.LICENSE))

    def _remove_tmp_app_dir(self):
        if os.path.isdir(self._tmp_app_dir):
            shutil.rmtree(self._tmp_app_dir)

    def _create_tmp_app_dir(self):
        if not os.path.isdir(self._tmp_app_dir):
            os.makedirs(self._tmp_app_dir)
