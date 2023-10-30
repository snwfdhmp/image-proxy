# Image Proxy

Transparently cache and compress images on the fly.

## Usage

```
GET /img
        ?url=<initial_image_url>
        &compress=<mode>
```

## How it works

- If the image is not cached yet, it will redirect to the original image while caching it in the background.
- Once a cached image exists, it will serve the cached image.
- It compression is requested, it will compress the image. Different compression modes can be requested for the same image at the same time. (image_url,compression_mode) pairs are cached separately.

## Compression

|mode|format|parameters used for compression|
|---|---|---|
|webp,lossless|webp|`-lossless 100 -q 100 -m 6`|
|webp,lossy,afq1|webp|`-af -q 1`|
|webp,lossy,afq10|webp|`-af -q 10`|
|webp,lossy,afq20|webp|`-af -q 20`|


## Example

Assuming the cache server is located at `https://proxy.com/`

Initial image URL: `https://blog.hubspot.com/hubfs/image8-2.jpg`

Cached only: `https://proxy.com/img?url=https://blog.hubspot.com/hubfs/image8-2.jpg`

Cached and compressed: `https://proxy.com/img?compress=webp,lossless&url=https://blog.hubspot.com/hubfs/image8-2.jpg`