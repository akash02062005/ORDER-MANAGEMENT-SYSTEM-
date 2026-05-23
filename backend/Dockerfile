# ---------- Stage 1: build the JAR with Maven ----------
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy only the pom first so Docker can cache dependency resolution
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Copy sources and build
COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ---------- Stage 2: slim runtime image ----------
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the fat jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Render injects PORT; Spring will read server.port from env
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
