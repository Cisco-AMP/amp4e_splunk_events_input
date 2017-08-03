import unittest
import logging

from bin.util.logger import Logger


class TestLogger(unittest.TestCase):
    def setUp(self):
        self.logger = Logger(Logger.LEVEL)

    def test_instantiation(self):
        self.assertEqual(self.logger.level, Logger.LEVEL)

    def test_call(self):
        self.assertIsInstance(self.logger(), logging.getLoggerClass())

    def test_logger(self):
        logger = Logger.logger()
        self.assertIsInstance(logger, logging.getLoggerClass())
        # Returns the same logger when called for the second time
        self.assertEqual(Logger.logger(), logger)
