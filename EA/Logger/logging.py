import logging
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base, declared_attr
from sqlalchemy.orm import sessionmaker
import datetime
from flask import g
from EA.Config.configuration import (DB_USERNAME, DB_PASSWORD, DB_HOST, LOG_DB_NAME)

Base = declarative_base()


class UserLogBase:
    __abstract__ = True  # Make this class abstract, so it doesn't create a table

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.now)
    category = Column(String(50))
    user_id = Column(String(50))
    function = Column(String(100))
    line_number = Column(Integer)
    flag = Column(String(50))
    message = Column(Text)
    exception = Column(Text)

    @declared_attr
    def __tablename__(cls):
        # Create table names dynamically based on user_id
        return f'logs_user_{cls.__user_id__}'

    @classmethod
    def create_table(cls, engine):
        cls.__table__.create(engine, checkfirst=True)


def create_user_log_class(user_id):
    # Create a new table class for each user
    class UserLog(Base, UserLogBase):
        __tablename__ = f'logs_user_{user_id}'
        __user_id__ = user_id
        # This ensures if the table is redefined, it extends the existing one.
        __table_args__ = {'extend_existing': True}

    return UserLog


# Setup database engine
DATABASE_URI = f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}/{LOG_DB_NAME}"
engine = create_engine(DATABASE_URI)
Base.metadata.bind = engine
Session = sessionmaker(bind=engine)

class DynamicDatabaseLogHandler(logging.Handler):
    def __init__(self, engine, user_id):
        super().__init__()
        self.engine = engine
        self.user_id = user_id
        self.Session = sessionmaker(bind=engine)
        # Dynamically create and bind the user log table
        self.user_log_class = create_user_log_class(user_id)
        self.user_log_class.create_table(engine)

    def emit(self, record):
        session = self.Session()
        try:
            log_entry = self.user_log_class(
                timestamp=datetime.datetime.now(),
                category=record.levelname,
                user_id=self.user_id,
                function=record.funcName,
                line_number=record.lineno,
                flag=getattr(record, 'flag', ''),
                message=record.getMessage(),
                exception=self.format(record) if record.exc_info else ''
            )
            session.add(log_entry)
            session.commit()
        finally:
            session.close()

class CustomLoggerAdapter(logging.LoggerAdapter):
    def process(self, msg, kwargs):
        kwargs['extra'] = kwargs.get('extra', {})
        kwargs['extra']['user_id'] = self.extra['user_id']
        kwargs['extra']['flag'] = getattr(g, 'flag', '')
        return msg, kwargs

# Example of setting up the dynamic database log handler
def setup_database_logger(user_id):
    logger = logging.getLogger(f'logger_{user_id}')
    logger.setLevel(logging.INFO)

    if not any(isinstance(handler, DynamicDatabaseLogHandler) for handler in logger.handlers):
        db_handler = DynamicDatabaseLogHandler(engine, user_id)
        logger.addHandler(db_handler)

    return CustomLoggerAdapter(logger, {'user_id': user_id})

def clean_old_logs(user_id):
    """
    Function to clean up logs older than 2 days for a specific user's log table.
    """
    session = Session()
    try:
        # Calculate the date two days ago from today
        two_days_ago = datetime.datetime.now() - datetime.timedelta(days=2)

        # Get the user's log class and delete entries older than two days
        user_log_class = create_user_log_class(user_id)
        rows_deleted = session.query(user_log_class).filter(user_log_class.timestamp < two_days_ago).delete()
        session.commit()
        g.glag = 1
        print(f"Deleted {rows_deleted} records from logs_user_{user_id} older than two days.")
    except Exception as e:
        session.rollback()
        print(f"Error cleaning logs for user {user_id}: {e}")
    finally:
        session.close()
