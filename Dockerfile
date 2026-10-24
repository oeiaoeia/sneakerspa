# Stage 1: Build the application with Maven & OpenJDK 21
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build application artifact
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Lightweight JRE runtime container for production (Render / Neon)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy packaged jar from build stage
COPY --from=build /app/target/sneakerspa-1.0.0.jar app.jar

# Environment defaults (Render sets $PORT dynamically)
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
