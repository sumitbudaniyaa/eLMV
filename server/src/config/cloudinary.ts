import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";
import { logger } from "./logger";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Upload buffer or base64 file to Cloudinary
 * For PDF certificates: resource_type is "raw" to preserve raw binary stream
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string,
  filename: string,
  resourceType: "image" | "raw" | "auto" = "auto"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `legal_metrology/${folder}`,
        public_id: filename,
        resource_type: resourceType,
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          logger.error({ error }, "Cloudinary upload failed");
          return reject(error);
        }
        if (!result?.secure_url) {
          return reject(new Error("Cloudinary did not return a secure URL"));
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
}

