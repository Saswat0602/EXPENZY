import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryType } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) { }

  async create(createCategoryDto: CreateCategoryDto, userId: string) {
    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        icon: createCategoryDto.icon,
        color: createCategoryDto.color,
        type: createCategoryDto.type,
        isSystem: createCategoryDto.isSystem || false,
        user: { connect: { id: userId } },
        parentCategory: createCategoryDto.parentCategoryId
          ? { connect: { id: createCategoryDto.parentCategoryId } }
          : undefined,
      },
    });
  }

  async findAll(userId: string, type?: CategoryType) {
    const whereClause: {
      OR: Array<{ isSystem: boolean } | { userId: string }>;
      type?: CategoryType;
    } = {
      OR: [{ isSystem: true }, { userId: userId }],
    };

    // Add type filter if provided
    if (type) {
      whereClause.type = type;
    }

    return this.prisma.category.findMany({
      where: whereClause,
      include: {
        subCategories: true,
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string, userId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        subCategories: true,
        parentCategory: true,
      },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    // Allow access to system categories or own categories
    if (!category.isSystem && category.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this category',
      );
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (category.isSystem) {
      throw new ForbiddenException('Cannot update system categories');
    }

    if (category.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this category',
      );
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: updateCategoryDto.name,
        icon: updateCategoryDto.icon,
        color: updateCategoryDto.color,
        type: updateCategoryDto.type,
        isSystem: updateCategoryDto.isSystem,
        parentCategory: updateCategoryDto.parentCategoryId
          ? { connect: { id: updateCategoryDto.parentCategoryId } }
          : undefined,
      },
    });
  }

  async remove(id: string, userId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (category.isSystem) {
      throw new ForbiddenException('Cannot delete system categories');
    }

    if (category.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this category',
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
