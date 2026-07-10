import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor() {
    const accessKeyId = process.env.Access_key_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.Secret_access_key || process.env.AWS_SECRET_ACCESS_KEY;
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.bucketName = process.env.AWS_S3_BUCKET || 'orientate-profile-images';

    if (!accessKeyId || !secretAccessKey) {
      console.warn('[S3Service] Alerta: Las credenciales de AWS S3 no están completamente configuradas en el archivo .env.');
    }

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || ''
      }
    });
  }

  async generatePresignedUploadUrl(userId: string): Promise<{ uploadUrl: string; fileUrl: string }> {
    const fileKey = `profiles/${userId}.jpg`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: 'image/jpeg'
    });

    // Expiración de 5 minutos (300 segundos)
    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 300 });
    
    // URL pública universal para acceder a la imagen una vez cargada
    const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileKey}`;

    return { uploadUrl, fileUrl };
  }
}
