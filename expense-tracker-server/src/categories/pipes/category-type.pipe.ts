import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { CategoryType } from '@prisma/client';

@Injectable()
export class CategoryTypePipe implements PipeTransform {
  transform(value: unknown): CategoryType | undefined {
    if (!value) {
      return undefined;
    }

    // Convert lowercase to uppercase enum value
    if (typeof value !== 'string') {
      throw new BadRequestException(
        `Invalid category type. Expected string, got ${typeof value}`,
      );
    }

    const upperValue = value.toUpperCase();

    // Validate against enum values
    if (Object.values(CategoryType).includes(upperValue as CategoryType)) {
      return upperValue as CategoryType;
    }

    throw new BadRequestException(
      `Invalid category type. Must be one of: ${Object.values(CategoryType).join(', ')}`,
    );
  }
}
