FROM golang:1.22-alpine AS builder

RUN apk add --no-cache git

WORKDIR /build
COPY backend/ .
RUN go mod tidy && go build -o server .

FROM alpine:3.19

RUN apk add --no-cache ca-certificates

WORKDIR /app
COPY --from=builder /build/server .
COPY index.html .
COPY script.js .
COPY style.css .
COPY fav.ico .

EXPOSE 8080

CMD ["./server"]
