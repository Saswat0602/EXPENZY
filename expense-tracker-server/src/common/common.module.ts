import { Module, Global } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
// import { AttachmentService } from './attachment.service'; // Disabled - Attachment model deleted
// import { AttachmentController } from './attachment.controller'; // Disabled - Attachment model deleted
import { ReminderService } from './reminder.service';
import { ReminderController } from './reminder.controller';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [
    MulterModule.register({
      dest: './uploads/temp',
    }),
  ],
  controllers: [
    // AttachmentController, // Disabled - Attachment model deleted
    ReminderController,
  ],
  providers: [
    // AttachmentService, // Disabled - Attachment model deleted
    ReminderService,
    EmailService,
  ],
  exports: [
    // AttachmentService, // Disabled - Attachment model deleted
    ReminderService,
    EmailService,
  ],
})
export class CommonModule { }
