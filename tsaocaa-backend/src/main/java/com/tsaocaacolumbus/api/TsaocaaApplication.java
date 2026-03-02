package com.tsaocaacolumbus.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TsaocaaApplication {

    public static void main(String[] args) {
        SpringApplication.run(TsaocaaApplication.class, args);
    }
}
