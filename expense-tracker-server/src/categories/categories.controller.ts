import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { CategoryType } from '@prisma/client';
import { CategoryTypePipe } from './pipes/category-type.pipe';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.categoriesService.create(createCategoryDto, user.userId);
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('type', CategoryTypePipe) type?: CategoryType,
  ) {
    return this.categoriesService.findAll(user.userId, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.categoriesService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.categoriesService.remove(id, user.userId);
  }
}
