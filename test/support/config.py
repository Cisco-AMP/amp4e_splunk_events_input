import os

SPLUNK_AUTH_OPTIONS = {
    'scheme': 'https',
    'host': os.getenv('SPLUNK_API_HOST', 'localhost'),
    'port': os.getenv('SPLUNK_API_PORT', 8089),
    'username': os.getenv('SPLUNK_API_USERNAME', 'admin'),
    'password': os.getenv('SPLUNK_PASSWORD', 'Change123!')
}
