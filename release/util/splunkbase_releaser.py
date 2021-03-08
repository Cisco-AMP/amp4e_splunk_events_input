import os, stat
from distutils.dir_util import copy_tree
from invoke import task, run
import shutil

class SplunkbaseReleaser:
    DIRS_TO_ARCHIVE = ['appserver', 'bin', 'certs', 'default', 'metadata', 'README', 'static']
    APP_NAME = 'amp4e_events_input'
    PATH_TO_PYTHON_LIBS = '/opt/splunk/lib/python3/site-packages'
    PYTHON_LIBS_TO_ARCHIVE = ['splunklib', 'pika']
    EXCLUDED_FILES = ['local.meta', 'requirements-splunk.txt', '*.pyc', '*.pyo']
    SPLUNKBASE_README = 'README_SPLUNKBASE.md'
    LICENSE = 'LICENSE'

    def __init__(self, app_dir):
        print(app_dir);
        self.app_dir = app_dir

    @property
    def _tmp_dir(self):
        return os.path.join('/tmp')

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
                invoke.Exit('The directory {} already exists and conflicts with a native Python package. ' \
                             'Please rename or delete it.'.format(dest_dir))
            else:
                copy_tree(os.path.join(self.PATH_TO_PYTHON_LIBS, l), dest_dir)

    def make_bin_dir_executable(self):
        for root, dirs, files in os.walk(os.path.join(self._tmp_app_dir, 'bin')):
            for f in files:
                os.chmod(os.path.join(root, f), stat.S_IRWXO)
            for d in dirs:
                os.chmod(os.path.join(root, d), stat.S_IRWXO)

    def create_archive(self):
        print("CREATING FILE")
        run("tar -czf {} {} -C {} {}"
              .format(self._release_file_path, self._excluded_files_arguments, self._tmp_dir, self.APP_NAME))

    def _remove_release_file(self):
        if os.path.exists(self._release_file_path):
            os.remove(self._release_file_path)

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
