# Image Proxy

## Usage

```
GET /image
        ?url=<initial_image_url>
        &compress=<mode>
```

|mode|format|parameters|
|---|---|---|
|webp,lossless,best|webp|`-lossless 100 -q 100 -m 6`|
|webp,lossy,afq1|webp|`-af -q 1`|
|webp,lossy,afq10|webp|`-af -q 10`|
|webp,lossy,afq20|webp|`-af -q 20`|

- If the image is not cached yet, it will redirect to the original image while caching the image in the background to disk.
- Once a cached image exists, it will serve the cached image.