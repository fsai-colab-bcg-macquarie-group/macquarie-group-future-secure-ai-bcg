import logging

from fsai_rag.utils.config import settings


def setup_logger() -> logging.Logger:
    logger = logging.getLogger("fsai_rag")

    # Set the log level based on the ENV from config
    if settings.ENV == "development":
        log_level = logging.DEBUG
    elif settings.ENV == "production":
        log_level = logging.WARNING
    else:
        log_level = logging.INFO

    logger.setLevel(log_level)

    # Create a console handler and set its level
    ch = logging.StreamHandler()
    ch.setLevel(log_level)

    # Create a formatter
    formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(message)s")

    ch.setFormatter(formatter)

    # Add the handler to the logger
    logger.addHandler(ch)

    return logger


# Create and configure the logger
logger = setup_logger()
