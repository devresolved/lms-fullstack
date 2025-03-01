import { Client } from "minio";
import { v4 } from "uuid";

const minioUrl = new URL(process.env.MINIO_URL as string);

const minioClient = new Client({
  endPoint: minioUrl.hostname,
  port: Number(minioUrl.port),
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY as string,
  secretKey: process.env.MINIO_SECRET_KEY as string,
});

const createDocument = async (file: File): Promise<string> => {
  const docId = v4();
  const params = {
    Bucket: process.env.MINIO_BUCKET as string,
    Key: docId,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
  };

  await minioClient.putObject(params.Bucket, params.Key, params.Body, params.Body.length, {
    "Content-Type": params.ContentType,
  });

  return docId;
};

const getDocumentUrl = async (docId: string): Promise<string> => {
  const link = process.env.MINIO_URL + "/" + process.env.MINIO_BUCKET + "/" + docId;
  return link;
};

const readDocument = async (
  docId: string,
): Promise<{
  data: Buffer;
  contentType: string;
}> => {
  const stream = await minioClient.getObject(process.env.MINIO_BUCKET as string, docId);
  const data: Buffer = await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => reject(err));
  });

  const stat = await minioClient.statObject(process.env.MINIO_BUCKET as string, docId);

  return {
    data,
    contentType: stat.metaData["content-type"] || "application/octet-stream",
  };
};

const deleteDocument = async (docId: string): Promise<void> => {
  await minioClient.removeObject(process.env.MINIO_BUCKET as string, docId);
};

export { createDocument, deleteDocument, readDocument, getDocumentUrl };
