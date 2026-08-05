# Stage 1: Compile/Build kode Go
FROM golang:1.21-alpine AS builder
WORKDIR /app

# Copy seluruh file di dalam folder backend ke kontainer
COPY . .

# Rapikan dependency dan unduh pustaka otomatis
RUN go mod tidy

# Compile kode ke bentuk binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server .

# Stage 2: Runtime Minimalis
FROM gcr.io/distroless/static-debian12
WORKDIR /
COPY --from=builder /app/server /server

EXPOSE 8080
USER nonroot:nonroot

ENTRYPOINT ["/server"]