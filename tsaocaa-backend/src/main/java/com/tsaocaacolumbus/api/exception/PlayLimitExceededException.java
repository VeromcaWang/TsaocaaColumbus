package com.tsaocaacolumbus.api.exception;

public class PlayLimitExceededException extends RuntimeException {
    public PlayLimitExceededException(String message) {
        super(message);
    }
}
