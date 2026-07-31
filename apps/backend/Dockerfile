# QuantEdge Backend Dockerfile
# Multi-stage build — Maven build → minimal JRE runtime
# Java 21 with Virtual Threads support

# ─── Stage 1: Build ──────────────────────────────────────────────────
FROM maven:3.9-amazoncorretto-21 AS builder

WORKDIR /app

# Cache dependencies first (layer caching)
COPY pom.xml ./
RUN mvn dependency:go-offline -q

# Copy source and build
COPY src ./src
RUN mvn package -DskipTests -q --enable-preview

# ─── Stage 2: Runtime ────────────────────────────────────────────────
FROM amazoncorretto:21-alpine AS runtime

WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Create non-root user
RUN addgroup -S quantedge && adduser -S quantedge -G quantedge

# Copy JAR from builder
COPY --from=builder /app/target/*.jar app.jar
RUN chown quantedge:quantedge app.jar

USER quantedge

# JVM tuning for container environment
ENV JAVA_OPTS="\
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -XX:+OptimizeStringConcat \
  -XX:+UseG1GC \
  --enable-preview \
  -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
