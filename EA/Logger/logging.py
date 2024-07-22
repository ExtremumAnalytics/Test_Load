import os
# for logging use
import logging

import csv
import datetime, time
from logging.handlers import TimedRotatingFileHandler
from flask import g, session


class CSVLogHandler(logging.Handler):
    def __init__(self, filename, mode='a', encoding='utf-8'):
        super().__init__()
        self.filename = filename
        self.mode = mode
        self.encoding = encoding
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        if not os.path.exists(filename):
            with open(filename, mode='w', newline='', encoding=self.encoding) as csvfile:
                writer = csv.DictWriter(csvfile,
                                        fieldnames=['timestamp', 'category', 'user_id', 'function', 'line_number',
                                                    'flag', 'message', 'exception'])
                writer.writeheader()

    def emit(self, record):
        log_entry = {
            'timestamp': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'category': record.levelname,
            'user_id': getattr(record, 'user_id', 'unknown_user'),
            'function': record.funcName,
            'line_number': record.lineno,
            'flag': getattr(record, 'flag', ''),
            'message': record.getMessage(),
            'exception': ''
        }
        if record.exc_info:
            log_entry['exception'] = self.format(record)

        with open(self.filename, self.mode, newline='', encoding=self.encoding) as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=log_entry.keys())
            writer.writerow(log_entry)


class CustomLoggerAdapter(logging.LoggerAdapter):
    def process(self, msg, kwargs):
        kwargs['extra'] = kwargs.get('extra', {})
        kwargs['extra']['user_id'] = self.extra['user_id']
        kwargs['extra']['flag'] = g.get('flag', '')
        return msg, kwargs


class CustomTimedRotatingFileHandler(TimedRotatingFileHandler):
    def __init__(self, filename, when='midnight', interval=1, backupCount=7, encoding=None, delay=False, utc=False,
                 atTime=None):
        super().__init__(filename, when, interval, backupCount, encoding, delay, utc, atTime)
        self.baseFilename = filename
        self.encoding = encoding
        self.csv_handler = CSVLogHandler(self.baseFilename, mode='a', encoding=self.encoding)
        # Write header to the new file when initializing
        with open(self.baseFilename, mode='w', newline='', encoding=self.encoding) as csvfile:
            writer = csv.DictWriter(csvfile,
                                    fieldnames=['timestamp', 'category', 'user_id', 'function', 'line_number', 'flag',
                                                'message', 'exception'])
            writer.writeheader()

    def doRollover(self):
        super().doRollover()
        # Reinitialize the CSVLogHandler to write the header in the new file
        self.csv_handler = CSVLogHandler(self.baseFilename, mode='a', encoding=self.encoding)
        # Write header to the new file
        with open(self.baseFilename, mode='w', newline='', encoding=self.encoding) as csvfile:
            writer = csv.DictWriter(csvfile,
                                    fieldnames=['timestamp', 'category', 'user_id', 'function', 'line_number', 'flag',
                                                'message', 'exception'])
            writer.writeheader()

    def emit(self, record):
        self.csv_handler.emit(record)


def setup_csv_logger(user_id):
    # log_file_name = f'logs/{user_id}/logfile_{user_id}_' + time.strftime('%Y-%m-%d_%H-%M-%S') +'.csv'
    folder_name = os.path.join('static', 'login', str(session['login_pin']))
    if not os.path.exists(folder_name):
        os.makedirs(folder_name)
    log_file_name = os.path.join(folder_name, f'logfile_{user_id}_' + time.strftime('%Y-%m-%d_%H-%M-%S') + '.csv')
    logger = logging.getLogger(f'logger_{user_id}')
    logger.setLevel(logging.INFO)

    if not any(isinstance(handler, CustomTimedRotatingFileHandler) for handler in logger.handlers):
        handler = CustomTimedRotatingFileHandler(log_file_name, when='midnight', interval=1, backupCount=7,
                                                 encoding='utf-8')
        logger.addHandler(handler)
    return CustomLoggerAdapter(logger, {'user_id': user_id})