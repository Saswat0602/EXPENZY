import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import * as crypto from 'crypto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) { }

  async create(createGroupDto: CreateGroupDto, userId: string) {
    return this.prisma.group.create({
      data: {
        name: createGroupDto.name,
        description: createGroupDto.description,
        imageUrl: createGroupDto.imageUrl,
        createdByUserId: userId,
        members: {
          create: {
            userId: userId,
            role: 'admin',
            inviteStatus: 'accepted',
            joinedAt: new Date(),
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.group.findMany({
      where: {
        isActive: true,
        members: {
          some: {
            userId: userId,
            inviteStatus: 'accepted',
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            splitExpenses: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        createdBy: true,
        members: {
          include: {
            user: true,
          },
        },
        groupExpenses: {
          include: {
            paidBy: true,
            category: true,
            splits: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            expenseDate: 'desc',
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    // Verify user is a member
    if (!this.isGroupMember(group, userId)) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    // Only admin can update
    if (!this.isGroupAdmin(group, userId)) {
      throw new ForbiddenException('Only group admins can update the group');
    }

    return this.prisma.group.update({
      where: { id },
      data: {
        name: updateGroupDto.name,
        description: updateGroupDto.description,
        imageUrl: updateGroupDto.imageUrl,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    // Only creator can delete
    if (group.createdByUserId !== userId) {
      throw new ForbiddenException(
        'Only the group creator can delete the group',
      );
    }

    return this.prisma.group.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async addMember(
    groupId: string,
    addMemberDto: AddGroupMemberDto,
    userId: string,
  ) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Only admin can add members
    if (!this.isGroupAdmin(group, userId)) {
      throw new ForbiddenException('Only group admins can add members');
    }

    // Check if member already exists
    if (addMemberDto.userId) {
      const existingMember = group.members.find(
        (m) => m.userId === addMemberDto.userId,
      );
      if (existingMember) {
        throw new BadRequestException('User is already a member of this group');
      }
    }

    // Generate invite token if email provided
    const inviteToken = addMemberDto.memberEmail
      ? crypto.randomBytes(32).toString('hex')
      : null;

    return this.prisma.groupMember.create({
      data: {
        groupId,
        userId: addMemberDto.userId,
        memberName: addMemberDto.memberName,
        memberEmail: addMemberDto.memberEmail,
        memberPhone: addMemberDto.memberPhone,
        role: addMemberDto.role || 'member',
        inviteToken,
        inviteStatus: addMemberDto.userId ? 'accepted' : 'pending',
        joinedAt: addMemberDto.userId ? new Date() : null,
      },
      include: {
        user: true,
        group: true,
      },
    });
  }

  async removeMember(groupId: string, memberId: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Only admin can remove members (or members can remove themselves)
    const member = group.members.find((m) => m.id === memberId);
    if (!member) {
      throw new NotFoundException('Member not found in this group');
    }

    const isAdmin = this.isGroupAdmin(group, userId);
    const isSelf = member.userId === userId;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenException(
        'You do not have permission to remove this member',
      );
    }

    // Prevent removing the last admin
    if (member.role === 'admin') {
      const adminCount = group.members.filter((m) => m.role === 'admin').length;
      if (adminCount === 1) {
        throw new BadRequestException(
          'Cannot remove the last admin from the group',
        );
      }
    }

    return this.prisma.groupMember.delete({
      where: { id: memberId },
    });
  }

  async acceptInvite(token: string, userId: string) {
    const member = await this.prisma.groupMember.findUnique({
      where: { inviteToken: token },
      include: {
        group: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Invalid invite token');
    }

    if (member.inviteStatus === 'accepted') {
      throw new BadRequestException('This invite has already been accepted');
    }

    return this.prisma.groupMember.update({
      where: { id: member.id },
      data: {
        userId,
        inviteStatus: 'accepted',
        joinedAt: new Date(),
        memberName: null, // Clear non-registered fields
      },
      include: {
        user: true,
        group: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }

  async getGroupMembers(groupId: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    if (!this.isGroupMember(group, userId)) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return this.prisma.groupMember.findMany({
      where: {
        groupId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getGroupExpenses(
    groupId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    if (!this.isGroupMember(group, userId)) {
      throw new ForbiddenException('You are not a member of this group');
    }

    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      this.prisma.groupExpense.findMany({
        where: {
          groupId,
        },
        include: {
          paidBy: true,
          category: true,
          splits: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          expenseDate: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.groupExpense.count({
        where: {
          groupId,
        },
      }),
    ]);

    return {
      data: expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  // Helper methods
  private isGroupMember(
    group: {
      members: Array<{ userId: string | null; inviteStatus: string | null }>;
    },
    userId: string,
  ): boolean {
    return group.members.some(
      (m) => m.userId === userId && m.inviteStatus === 'accepted',
    );
  }

  private isGroupAdmin(
    group: {
      members: Array<{
        userId: string | null;
        role: string;
        inviteStatus: string | null;
      }>;
    },
    userId: string,
  ): boolean {
    return group.members.some(
      (m) =>
        m.userId === userId &&
        m.role === 'admin' &&
        m.inviteStatus === 'accepted',
    );
  }
}
