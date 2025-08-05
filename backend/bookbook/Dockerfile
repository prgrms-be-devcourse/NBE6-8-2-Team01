FROM openjdk:21
COPY build/libs/bookbook-0.0.1-SNAPSHOT.jar app.jar
COPY .env .env
ENTRYPOINT ["java", "-jar", "/app.jar"]