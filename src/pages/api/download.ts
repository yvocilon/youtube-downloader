import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import youtubedl from "youtube-dl";
import path from "path";

export default (req: NextApiRequest, res: NextApiResponse) => {
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

  links.forEach(download);

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ name: "John Doe" }));
};

function download(url: string) {
  const video = youtubedl(url, ["-f best"], {});

  video.on("info", function onInfo(info) {
    video.pipe(fs.createWriteStream(path.join("downloads", info._filename)));
  });
}
