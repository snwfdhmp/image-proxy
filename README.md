# Image Proxy

## Usage

```
GET /image
        ?url=<initial_image_url>
        &compress=<mode>
```

|mode|format|parameters|
|---|---|---|
|webp,lossless|webp|`-lossless 100 -q 100 -m 6`|
|webp,lossy,afq1|webp|`-af -q 1`|
|webp,lossy,afq10|webp|`-af -q 10`|
|webp,lossy,afq20|webp|`-af -q 20`|

- If the image is not cached yet, it will redirect to the original image while caching the image in the background to disk.
- Once a cached image exists, it will serve the cached image.

## Example

Suppose the cache server is located at `https://proxy.com/`

Initial image URL: `https://blog.hubspot.com/hubfs/image8-2.jpg`

Cached and compressed: `https://proxy.com/img?compress=webp,lossless&url=https://blog.hubspot.com/hubfs/image8-2.jpg`