import logging
import logging.handlers
import os
import sys


class Logger:
    LOGGER_NAME = 'Amp4eEvents'
    SPLUNK_HOME = os.environ.get('SPLUNK_HOME', sys.prefix)
    LEVEL = 'INFO'
    logger_instance = None

    @classmethod
    def logger(cls):
        if cls.logger_instance is None:
            cls.logger_instance = cls(cls.LEVEL)()
        return cls.logger_instance

    def __init__(self, level):
        self.level = level

    def __call__(self):
        logger = logging.getLogger(self.LOGGER_NAME)
        logger.setLevel(self.level)

        logger.propagate = False  # Prevent the log messages from being duplicated in the python.log file

        log_file_path = os.path.join(self.SPLUNK_HOME, 'var', 'log', 'splunk', 'amp4e_events_input.log')
        formatter = logging.Formatter('%(asctime)s %(levelname)s ' + self.LOGGER_NAME + ' - %(message)s')
        file_handler = logging.handlers.RotatingFileHandler(log_file_path, maxBytes=25000000, backupCount=5)
        file_handler.setFormatter(formatter)

        logger.addHandler(file_handler)

        return logger

logger = Logger.logger()
