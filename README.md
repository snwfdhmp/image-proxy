# Image Proxy

## Usage

GET /image?url=URL&cache_ttl=SECONDS&compress_mode=webp&compress_args=-q 1 -af

- Determine local filepath
- If not exist, serve proxy image, save to local, run compress if needed
- If exist, serve local image, update cache if ttl expired