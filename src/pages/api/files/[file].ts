import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import mime from "mime";
import fs from "fs";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { file },
  } = req;

  if (!file || req.method !== "GET") {
    res.statusCode = 404;
    res.end();
  }

  const filePath = path.join("downloads", file as string);
  const mimeType = mime.getType(filePath);

  res.setHeader(
    "Content-disposition",
    "attachment; filename=" + encodeURIComponent(file as string)
  );
  res.setHeader("Content-type", mimeType);

  fs.createReadStream(filePath).pipe(res);
};
