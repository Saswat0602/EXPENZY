import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReminderService } from './reminder.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@ApiTags('Reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reminders')
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reminder' })
  create(
    @Body() createDto: CreateReminderDto,
    @Request() req: RequestWithUser,
  ) {
    return this.reminderService.create(createDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reminders' })
  findAll(@Request() req: RequestWithUser) {
    return this.reminderService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific reminder' })
  findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.reminderService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a reminder' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateReminderDto,
    @Request() req: RequestWithUser,
  ) {
    return this.reminderService.update(id, updateDto, req.user.userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark reminder as read' })
  markAsRead(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.reminderService.markAsRead(id, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reminder' })
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.reminderService.remove(id, req.user.userId);
  }
}
