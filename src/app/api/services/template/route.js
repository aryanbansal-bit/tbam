import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const KEY = 'templates/rotary3012/daily.html';

export async function GET() {
  try {
    const obj = await r2.send(new GetObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: KEY,
    }));

    const content = await obj.Body.transformToString();

    return Response.json({ content });

  } catch (e) {
    return Response.json({ error: 'Failed to load template' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { content } = await req.json();

    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: KEY,
      Body: content,
      ContentType: 'text/html',
    }));

    return Response.json({ message: 'Saved successfully' });

  } catch (e) {
    return Response.json({ error: 'Save failed' }, { status: 500 });
  }
}
