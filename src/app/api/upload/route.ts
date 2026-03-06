import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { writeFile, mkdir, chmod } from 'fs/promises';
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
      // Fallback to local file system (for local development or VPS without Blob token)
      const buffer = Buffer.from(await file.arrayBuffer());
      
      if (buffer.length === 0) {
        throw new Error('File buffer is empty');
      }

      const uploadDir = join(process.cwd(), 'public/images/uploads');
      
      // Ensure directory exists with correct permissions
      try {
        await mkdir(uploadDir, { recursive: true });
        // Try to set directory permissions if on Linux
        if (process.platform !== 'win32') {
          await chmod(uploadDir, 0o777);
        }
      } catch (err) {
        console.warn('Directory creation warning:', err);
      }

      // Create unique filename
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `upload-${uniqueSuffix}.${ext}`;
      const filepath = join(uploadDir, filename);

      console.log('Writing file to:', filepath);
      await writeFile(filepath, buffer);

      // Set file permissions to be readable by everyone (crucial for VPS/Nginx)
      if (process.platform !== 'win32') {
        try {
          await chmod(filepath, 0o644);
        } catch (e) {
          console.error('Failed to set file permissions:', e);
        }
      }

      const publicUrl = `/images/uploads/${filename}`;
      console.log('Upload successful, public URL:', publicUrl);

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
