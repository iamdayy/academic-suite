// 📁 apps/web/app/api/upload/route.ts
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import * as jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      // Ini adalah 'hook' keamanan kita.
      // Ini berjalan SEBELUM Vercel Blob membuat URL upload.
      onBeforeGenerateToken: async (pathname) => {
        // 1. Dapatkan token dari cookie
        const cookieStore = cookies();
        const token = (await cookieStore).get("token")?.value;

        if (!token) {
          throw new Error("Otentikasi gagal: Tidak ada token.");
        }

        // 2. Verifikasi token menggunakan secret yang sama
        try {
          jwt.verify(token, process.env.JWT_SECRET!);
        } catch (error) {
          throw new Error("Otentikasi gagal: Token tidak valid.");
        }

        // 3. Jika token valid, izinkan upload
        return {
          allowedContentTypes: [
            "application/pdf",
            "application/zip",
            "application/msword", // .doc
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
            "image/jpeg",
            "image/png",
            "text/plain",
          ],
          // Anda bisa menambahkan info user dari token ke payload
          // tokenPayload: JSON.stringify({ userId: payload.sub }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("Vercel Blob upload completed", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 } // Kirim 'Bad Request' jika error
    );
  }
}
