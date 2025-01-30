// lib/minio-client.ts
import { Client } from "minio";
import { v4 } from "uuid";

// Types
interface IUploadResponse {
  docId: string;
  url: string;
}

interface IDocumentMetadata {
  contentType: string;
  size: number;
}

// Initialize MinIO client
const minioUrl = new URL(process.env.MINIO_URL as string);

const minioClient = new Client({
  endPoint: minioUrl.hostname,
  port: Number(minioUrl.port),
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY as string,
  secretKey: process.env.MINIO_SECRET_KEY as string,
});

const bucket = process.env.MINIO_BUCKET as string;

/**
 * Creates a presigned URL for uploading a document and returns document ID
 */
const createDocument = async (file: File, expirySeconds = 3600): Promise<IUploadResponse> => {
  try {
    const docId = v4();

    // Generate presigned URL for PUT operation
    const url = await minioClient.presignedPutObject(bucket, docId, expirySeconds);

    // Use the URL to upload the file directly from the client
    await fetch(url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    return {
      docId,
      url: `${process.env.MINIO_URL}/${bucket}/${docId}`,
    };
  } catch (error) {
    console.error("Error creating document:", error);
    throw new Error("Failed to create document");
  }
};

/**
 * Gets a presigned URL for downloading a document
 */
const getDocumentUrl = async (docId: string, expirySeconds = 3600): Promise<string> => {
  try {
    // Generate presigned URL for GET operation
    const url = await minioClient.presignedGetObject(bucket, docId, expirySeconds);
    return url;
  } catch (error) {
    console.error("Error getting document URL:", error);
    throw new Error("Failed to get document URL");
  }
};

/**
 * Gets document metadata and content using presigned URL
 */
const readDocument = async (
  docId: string,
): Promise<{
  data: Buffer;
  contentType: string;
}> => {
  try {
    // Get object stats first to verify existence and get metadata
    const stat = await minioClient.statObject(bucket, docId);

    // Generate presigned URL for GET operation
    const url = await minioClient.presignedGetObject(bucket, docId, 60);

    // Fetch the document using the presigned URL
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const data = Buffer.from(arrayBuffer);

    return {
      data,
      contentType: stat.metaData["content-type"] || "application/octet-stream",
    };
  } catch (error) {
    console.error("Error reading document:", error);
    throw new Error("Failed to read document");
  }
};

/**
 * Deletes a document and returns a presigned URL for verification
 */
const deleteDocument = async (docId: string): Promise<void> => {
  try {
    await minioClient.removeObject(bucket, docId);
  } catch (error) {
    console.error("Error deleting document:", error);
    throw new Error("Failed to delete document");
  }
};

/**
 * Gets document metadata without downloading the content
 */
const getDocumentMetadata = async (docId: string): Promise<IDocumentMetadata> => {
  try {
    const stat = await minioClient.statObject(bucket, docId);
    return {
      contentType: stat.metaData["content-type"] || "application/octet-stream",
      size: stat.size,
    };
  } catch (error) {
    console.error("Error getting document metadata:", error);
    throw new Error("Failed to get document metadata");
  }
};

/**
 * Checks if a document exists
 */
const documentExists = async (docId: string): Promise<boolean> => {
  try {
    await minioClient.statObject(bucket, docId);
    return true;
  } catch (error) {
    console.error("Error checking document existence:", error);
    return false;
  }
};

// Usage example:
/*
// Upload a file
const uploadFile = async (file: File) => {
  try {
    const { docId, url } = await createDocument(file);
    console.log('File uploaded successfully. URL:', url);
    return docId;
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// Get a download URL
const getDownloadUrl = async (docId: string) => {
  try {
    const url = await getDocumentUrl(docId);
    console.log('Download URL:', url);
    return url;
  } catch (error) {
    console.error('Failed to get download URL:', error);
  }
};

// Delete a file
const deleteFile = async (docId: string) => {
  try {
    await deleteDocument(docId);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Delete failed:', error);
  }
};
*/

export {
  createDocument,
  deleteDocument,
  readDocument,
  getDocumentUrl,
  getDocumentMetadata,
  documentExists,
  type IUploadResponse,
  type IDocumentMetadata,
};
