docker rm -f gj-server

docker build -t gj-server .

docker run -p 80:3000 --name gj-server -d gj-server:latest