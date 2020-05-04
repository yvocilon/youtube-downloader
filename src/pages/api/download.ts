import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import youtubedl from "youtube-dl";
import path from "path";
import { fetchDownloads } from "./downloads";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.statusCode = 404;
    res.end();
    return;
  }

  const { links = [] } = req.body;

  if (!links.length) {
    res.statusCode = 400;
    return res.end();
  }

  const promises = links.map(download);

  await Promise.all(promises);

  const files = await fetchDownloads();

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(files));
};

function download(url: string) {
  return new Promise((resolve, reject) => {
    const video = youtubedl(url, ["-f best"], {});

    video.on("end", resolve);

    video.on("error", reject);

    video.on("info", function onInfo(info) {
      video.pipe(fs.createWriteStream(path.join("downloads", info._filename)));
    });
  });
}
