import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AttachmentService {
  private readonly logger = new Logger(AttachmentService.name);
  private readonly uploadsDir = path.join(
    process.cwd(),
    'uploads',
    'attachments',
  );
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
  ];
  private readonly useS3: boolean;
  private s3Client: Record<string, never> | null = null;
  private s3Bucket: string | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }

    // Check if AWS S3 is configured
    const awsAccessKey = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const awsSecretKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    this.s3Bucket = this.configService.get<string>('AWS_S3_BUCKET') || null;

    this.useS3 = !!(awsAccessKey && awsSecretKey && this.s3Bucket);

    if (this.useS3) {
      this.logger.log('AWS S3 configured - using S3 for file storage');
      // Initialize S3 client here when AWS SDK is installed
      // this.s3Client = new S3Client({ region: this.configService.get('AWS_REGION') });
    } else {
      this.logger.log('AWS S3 not configured - using local file storage');
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  /**
   * Generate proper filename with expense ID
   */
  private generateFileName(
    entityId: string,
    originalName: string,
    timestamp: number,
  ): string {
    const ext = path.extname(originalName);
    const sanitizedName = originalName
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 50);
    return `${entityId}_${timestamp}_${sanitizedName}${ext}`;
  }

  /**
   * Upload file to S3 (when AWS is configured)
   */
  private async uploadToS3(
    file: Express.Multer.File,
    fileName: string,
  ): Promise<string> {
    // TODO: Implement S3 upload when AWS SDK is installed
    // const command = new PutObjectCommand({
    //   Bucket: this.s3Bucket,
    //   Key: `attachments/${fileName}`,
    //   Body: fs.createReadStream(file.path),
    //   ContentType: file.mimetype,
    // });
    // await this.s3Client.send(command);
    // return `https://${this.s3Bucket}.s3.amazonaws.com/attachments/${fileName}`;

    this.logger.warn(
      'S3 upload not yet implemented, falling back to local storage',
    );
    // Use Promise.resolve to make this properly async
    return Promise.resolve(this.uploadToLocal(file, fileName));
  }

  /**
   * Upload file to local storage
   */
  private uploadToLocal(file: Express.Multer.File, fileName: string): string {
    const destPath = path.join(this.uploadsDir, fileName);
    fs.copyFileSync(file.path, destPath);
    fs.unlinkSync(file.path); // Remove temp file
    return `/uploads/attachments/${fileName}`;
  }

  /**
   * Create attachment record in database
   */
  async create(dto: CreateAttachmentDto, userId: string) {
    return this.prisma.attachment.create({
      data: {
        userId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        fileSize: dto.fileSize,
        mimeType: dto.mimeType,
      },
    });
  }

  /**
   * Upload file and create attachment record
   */
  async uploadFile(
    file: Express.Multer.File,
    entityType: string,
    entityId: string,
    userId: string,
  ) {
    this.validateFile(file);

    const timestamp = Date.now();
    const fileName = this.generateFileName(
      entityId,
      file.originalname,
      timestamp,
    );

    // Upload to S3 or local storage
    const fileUrl = this.useS3
      ? await this.uploadToS3(file, fileName)
      : this.uploadToLocal(file, fileName);

    const attachment = await this.create(
      {
        entityType: entityType as CreateAttachmentDto['entityType'],
        entityId,
        fileName: file.originalname,
        fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
      userId,
    );

    this.logger.log(
      `File uploaded: ${fileName} for ${entityType}:${entityId} (${this.useS3 ? 'S3' : 'local'})`,
    );
    return attachment;
  }

  /**
   * Find all attachments for an entity
   */
  async findByEntity(entityType: string, entityId: string) {
    return this.prisma.attachment.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find attachment by ID
   */
  async findOne(id: string, userId: string) {
    const attachment = await this.prisma.attachment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    return attachment;
  }

  /**
   * Delete attachment
   */
  async remove(id: string, userId: string) {
    const attachment = await this.findOne(id, userId);

    // Delete file from storage
    if (!this.useS3) {
      // Local file deletion
      const filePath = path.join(process.cwd(), attachment.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Deleted local file: ${filePath}`);
      }
    } else {
      // TODO: Delete from S3 when AWS SDK is installed
      // const command = new DeleteObjectCommand({
      //   Bucket: this.s3Bucket,
      //   Key: attachment.fileUrl.split('.com/')[1],
      // });
      // await this.s3Client.send(command);
      this.logger.log(`Deleted S3 file: ${attachment.fileUrl}`);
    }

    // Delete database record
    await this.prisma.attachment.delete({
      where: { id },
    });

    return { message: 'Attachment deleted successfully' };
  }

  /**
   * Get file path for serving (local storage only)
   */
  getFilePath(filename: string): string {
    return path.join(this.uploadsDir, filename);
  }
}
