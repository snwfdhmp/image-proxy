import colors from "colors"
import express from "express"
import url from "url"
import https from "https"
import fs from "fs"
import child_process from "child_process"
import xxhash from "xxhash"

const app = express()

const SERVER_PORT = 65304

const __dirname = new URL(".", import.meta.url).pathname
const DATA_PATH = `${__dirname}.cache`

await fs.promises.mkdir(DATA_PATH, { recursive: true })

const log = {
  info: async (msg) => {
    let date = new Date()
    date = date.toLocaleString("fr-FR", { timeZone: "Europe/Paris" })
    if (msg instanceof Object) msg = JSON.stringify(msg)
    console.log(`${date} [${"INFO".blue}] ${msg}`)
  },
}

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "*")
  res.setHeader("Access-Control-Allow-Headers", "*")

  log.info(`${req.method} ${req.url}`)
  next()
})
app.get("/img", async (req, res) => {
  const times = {}
  times.start = Date.now()
  times.start2 = Date.now()
  const queryIndex = req.url.indexOf("?")
  if (queryIndex === -1) {
    res.status(400).send("400 Bad Request. Missing query string.")
    return
  }
  if (!req.query.url) {
    res.status(400).send("400 Bad Request. Missing url.")
    return
  }
  const queryString = req.url.slice(queryIndex + 1)
  const queryParams = req.query
  // if path is not safe, return 403
  if (queryString.indexOf("..") !== -1) {
    res.status(403).send("403 Forbidden. Contains '..'")
    return
  }
  times.preLocalPath = Date.now()
  const localPath = getLocalPath(queryString, queryParams)
  times.postLocalPath = Date.now()
  try {
    await fs.promises.access(localPath)
    times.postAccess = Date.now()
    res.sendFile(localPath)
    times.postSendFile = Date.now()
    log.info(`served ${localPath}`)
    timesLog(times)
  } catch (e) {
    if (e.code === "ENOENT") {
      // redirect to url
      res.redirect(307, queryParams.url)
      getImage(queryString, queryParams, localPath)
      return
    }
    res.status(500).send("500 Internal Server Error.")
    console.log(`500 error: ${e}`)
  }
})

const timesLog = (times) => {
  let previousTime = times.start
  for (const id in times) {
    console.log(`${id}: ${times[id] - previousTime}ms`)
    previousTime = times[id]
  }
  return previousTime
}

const getLocalPath = (queryString, queryParams) => {
  const uri = xxhash.hash64(Buffer.from(queryString), 0).toString("hex")
  const SPLIT_LENGTH = 4
  const iterations = Math.ceil(uri.length / SPLIT_LENGTH)
  let path = `${DATA_PATH}`
  for (let i = 0; i < iterations; i++) {
    path += "/" + uri.slice(i * SPLIT_LENGTH, (i + 1) * SPLIT_LENGTH)
  }
  return path
}

const getImage = async (queryString, queryParams, localPath) => {
  await fs.promises.mkdir(localPath.split("/").slice(0, -1).join("/"), {
    recursive: true,
  })
  // download image to file
  const downloadPath = `/tmp/img.${Date.now()}.${encodeURIComponent(
    queryParams.url
  )}`
  let finalPath = downloadPath
  log.info(`downloading ${queryParams.url} to ${downloadPath}`)
  await httpDownload(queryParams.url, downloadPath)

  switch (queryParams.compress) {
    case "webp":
    case "webp,lossless,best":
      finalPath = await compress.webp(downloadPath, "-lossless 100 -q 100 -m 6")
      break
    case "webp,lossy,afq1":
      finalPath = await compress.webp(downloadPath, "-af -q 1")
      break
    case "webp,lossy,afq10":
      finalPath = await compress.webp(downloadPath, "-af -q 10")
      break
    case undefined:
      log.info("no compress")
      break
    default:
      log.info(`unknown compress type ${queryParams.compress}`)
  }
  if (finalPath != downloadPath) {
    fs.promises.rm(downloadPath)
  }

  log.info(`renaming ${finalPath} to ${localPath}`)
  await fs.promises.rename(finalPath, localPath)
}

const compress = {
  webp: (path, argsString) => {
    return new Promise((resolve, reject) => {
      log.info(`compressing ${path} with args ${argsString}`)
      const outPath = path + ".webp"

      child_process.exec(
        `cwebp ${argsString} -mt -o ${outPath} ${path}`,
        (err, stdout, stderr) => {
          if (err) {
            reject(err)
            return
          }
          resolve(outPath)
        }
      )
    })
  },
}

const httpDownload = (url, localPath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      res.pipe(fs.createWriteStream(localPath))

      res.on("end", () => {
        resolve()
      })
      res.on("error", (err) => {
        reject(err)
      })
    })
  })
}

app.listen(SERVER_PORT, () => {
  log.info(`server is running at port ${SERVER_PORT}`.green)
})
