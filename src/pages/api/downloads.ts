import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { promisify } from "util";

const readDirAsync = promisify(fs.readdir);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.statusCode = 404;
    res.end();
    return;
  }

  const files = await fetchDownloads();

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(files));
};

export async function fetchDownloads() {
  return readDirAsync("downloads");
}
