import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import youtubedl from "youtube-dl";
import path from "path";
import { fetchDownloads } from "./downloads";
import ffmpeg from "fluent-ffmpeg";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.statusCode = 404;
    res.end();
    return;
  }

  const { links = [], type = "video" } = req.body;

  if (!links.length) {
    res.statusCode = 400;
    return res.end();
  }

  const promises = links.map(download(type));

  await Promise.all(promises);

  const files = await fetchDownloads();

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(files));
};

function download(type: string) {
  return function startDownload(url: string) {
    return new Promise((resolve, reject) => {
      const video = youtubedl(url, ["-f best", "--no-mtime"], {});

      video.on("error", reject);

      video.on("info", function onInfo(info) {
        const filePath = path.join("downloads", info._filename);

        video.pipe(fs.createWriteStream(filePath));

        video.on("end", async () => {
          if (type === "video") {
            return resolve();
          }

          await convertVideoToAudio(filePath);
          resolve();
        });
      });
    });
  };
}

function convertVideoToAudio(filePath: string) {
  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .output(filePath.substr(0, filePath.lastIndexOf(".")) + ".mp3")
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
}
