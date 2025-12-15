import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AttachmentService } from './attachment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as path from 'path';
import type { Response } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@ApiTags('Attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file attachment' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        entityType: {
          type: 'string',
          enum: ['expense', 'group_expense', 'income'],
        },
        entityId: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (_req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          cb(null, `temp-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @Request() req: RequestWithUser,
  ) {
    if (!entityType || !entityId) {
      throw new BadRequestException('entityType and entityId are required');
    }

    return this.attachmentService.uploadFile(
      file,
      entityType,
      entityId,
      req.user.userId,
    );
  }

  @Get(':entityType/:entityId')
  @ApiOperation({ summary: 'Get all attachments for an entity' })
  findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.attachmentService.findByEntity(entityType, entityId);
  }

  @Get('file/:id')
  @ApiOperation({ summary: 'Download attachment file' })
  async downloadFile(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const attachment = await this.attachmentService.findOne(
      id,
      req.user.userId,
    );
    const filePath = path.join(process.cwd(), attachment.fileUrl);
    res.download(filePath, attachment.fileName);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attachment' })
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.attachmentService.remove(id, req.user.userId);
  }
}
