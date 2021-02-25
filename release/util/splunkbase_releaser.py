import os
from distutils.dir_util import copy_tree

from fabric.api import local
from fabric.utils import abort as fabric_abort

from abstract_releaser import AbstractReleaser


class SplunkbaseReleaser(AbstractReleaser):
    DIRS_TO_ARCHIVE = ['appserver', 'bin', 'certs', 'default', 'metadata', 'README', 'static']
    APP_NAME = 'amp4e_events_input'
    PATH_TO_PYTHON_LIBS = '/opt/splunk/lib/python3/site-packages'
    PYTHON_LIBS_TO_ARCHIVE = ['splunklib', 'pika']
    EXCLUDED_FILES = ['local.meta', 'requirements-splunk.txt', '*.pyc', '*.pyo']

    @property
    def _release_file_path(self):
        return os.path.join(self.app_dir, 'release', '{}.spl'.format(self.APP_NAME))

    def __call__(self):
        self.prepare()
        self.copy_dirs()
        self.copy_python_libs()
        self.make_bin_dir_executable()
        self.copy_splunk_readme()
        self.copy_license()
        self.create_archive()
        self._remove_tmp_app_dir()

    def prepare(self):
        self._remove_tmp_app_dir()
        self._remove_release_file()
        self._create_tmp_app_dir()

    def copy_python_libs(self):
        for l in self.PYTHON_LIBS_TO_ARCHIVE:
            dest_dir = os.path.join(self._tmp_app_dir, 'bin', l)
            if os.path.isdir(dest_dir):
                fabric_abort('The directory {} already exists and conflicts with a native Python package. ' \
                             'Please rename or delete it.'.format(dest_dir))
            else:
                copy_tree(os.path.join(self.PATH_TO_PYTHON_LIBS, l), dest_dir)

    def make_bin_dir_executable(self):
        for root, dirs, files in os.walk(os.path.join(self._tmp_app_dir, 'bin')):
            for f in files:
                os.chmod(os.path.join(root, f), 0755)
            for d in dirs:
                os.chmod(os.path.join(root, d), 0755)

    def create_archive(self):
        local("tar -czf {} {} -C {} {}"
              .format(self._release_file_path, self._excluded_files_arguments, self._tmp_dir, self.APP_NAME))

    def _remove_release_file(self):
        if os.path.exists(self._release_file_path):
            os.remove(self._release_file_path)
