import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check if we have Vercel Blob configured
    const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

    if (hasBlobToken) {
      // Use Vercel Blob
      const blob = await put(file.name, file, {
        access: 'public',
      });
      return NextResponse.json({ url: blob.url });
    } else {
      // Check if running on Vercel without token
      if (process.env.VERCEL) {
        console.error('Vercel Blob Token missing in Vercel environment');
        return NextResponse.json(
          { error: 'Vercel Blob storage is not configured. Please add BLOB_READ_WRITE_TOKEN to your environment variables.' },
          { status: 500 }
        );
      }

      // Fallback to local file system (for local development without Blob token)
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadDir = join(process.cwd(), 'public/images/uploads');
      
      // Ensure directory exists
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch {
        // Ignore if exists
      }

      // Create unique filename
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `upload-${uniqueSuffix}.${ext}`;
      const filepath = join(uploadDir, filename);

      await writeFile(filepath, buffer);

      const publicUrl = `/images/uploads/${filename}`;

      return NextResponse.json({ url: publicUrl });
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: `Error uploading file: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
