import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: { message?: string };
};

function requireEnv(name: "CLOUDINARY_CLOUD_NAME" | "CLOUDINARY_API_KEY" | "CLOUDINARY_API_SECRET") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing Cloudinary environment variable: ${name}`);
  }
  return value;
}

function getCloudinaryConfig() {
  const cloudName = requireEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = requireEnv("CLOUDINARY_API_KEY");
  const apiSecret = requireEnv("CLOUDINARY_API_SECRET");
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "attendance-proofs";

  return { cloudName, apiKey, apiSecret, folder };
}

function generateCloudinarySignature(
  params: Record<string, string>,
  apiSecret: string
) {
  const toSign = Object.entries(params)
    .filter(([, value]) => Boolean(value))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${toSign}${apiSecret}`)
    .digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WEBP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    const { cloudName, apiKey, apiSecret, folder } = getCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = generateCloudinarySignature(
      { folder, timestamp },
      apiSecret
    );

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("api_key", apiKey);
    cloudinaryFormData.append("timestamp", timestamp);
    cloudinaryFormData.append("signature", signature);
    cloudinaryFormData.append("folder", folder);

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    const cloudinaryData =
      (await cloudinaryResponse.json()) as CloudinaryUploadResponse;

    if (!cloudinaryResponse.ok || !cloudinaryData.secure_url) {
      const cloudinaryMessage =
        cloudinaryData.error?.message || "Failed to upload to Cloudinary";
      throw new Error(cloudinaryMessage);
    }

    return NextResponse.json({ url: cloudinaryData.secure_url }, { status: 201 });
  } catch (error) {
    console.error("POST Upload Error:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
