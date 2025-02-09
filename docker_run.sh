docker stop image-proxy
docker rm image-proxy
docker build -t snwfdhmp1/image-proxy .
docker run -d --name image-proxy --restart unless-stopped --network host snwfdhmp1/image-proxy