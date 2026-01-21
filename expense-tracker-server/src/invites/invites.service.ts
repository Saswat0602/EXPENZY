import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupsService } from '../groups/groups.service';
import { EmailService } from '../common/email.service';
import {
  InviteType,
  InviteStatus,
  InviteDetails,
} from './interfaces/invite.interface';

@Injectable()
export class InvitesService {
  private readonly INVITE_EXPIRATION_DAYS = 7;

  constructor(
    private prisma: PrismaService,
    private groupsService: GroupsService,
    private emailService: EmailService,
  ) {}

  async getInviteDetails(token: string): Promise<InviteDetails> {
    // Only check group members (loans and splits don't have invite functionality)
    const groupMember = await this.prisma.groupMember.findUnique({
      where: { inviteToken: token },
      include: {
        group: {
          include: {
            createdBy: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (groupMember) {
      // GroupMember doesn't have invitedAt, use createdAt as fallback
      const inviteDate = groupMember.createdAt;
      const isExpired = false; // Groups don't expire for now

      return {
        type: InviteType.GROUP,
        status: groupMember.inviteStatus as InviteStatus,
        invitedAt: inviteDate,
        isExpired,
        entityId: groupMember.groupId,
        entityDetails: {
          groupId: groupMember.groupId,
          groupName: groupMember.group.name,
          description: groupMember.group.description,
          memberCount: groupMember.group._count.members,
          role: groupMember.role as 'admin' | 'member',
          createdBy: {
            id: groupMember.group.createdBy.id,
            username: groupMember.group.createdBy.username,
            email: groupMember.group.createdBy.email,
          },
        },
      };
    }

    throw new NotFoundException('Invalid invite token');
  }

  async acceptInvite(
    token: string,
    userId: string,
  ): Promise<{ type: InviteType; entity: unknown }> {
    const inviteDetails = await this.getInviteDetails(token);

    if (inviteDetails.isExpired) {
      throw new BadRequestException('This invite has expired');
    }

    if (inviteDetails.status === InviteStatus.ACCEPTED) {
      throw new BadRequestException('This invite has already been accepted');
    }

    // Only handle group invites
    if (inviteDetails.type === InviteType.GROUP) {
      const group = await this.groupsService.acceptInvite(token, userId);
      return { type: InviteType.GROUP, entity: group };
    }

    throw new BadRequestException('Unknown invite type');
  }

  async resendInvite(
    token: string,
    userId: string,
  ): Promise<{ message: string; inviteLink: string }> {
    const inviteDetails = await this.getInviteDetails(token);

    // Verify user is the creator
    const creatorId = inviteDetails.entityDetails.createdBy.id;
    if (creatorId !== userId) {
      throw new ForbiddenException(
        'Only the invite creator can resend invites',
      );
    }

    if (inviteDetails.status === InviteStatus.ACCEPTED) {
      throw new BadRequestException('Cannot resend an already accepted invite');
    }

    // Get the group member to find the email
    const groupMember = await this.prisma.groupMember.findUnique({
      where: { inviteToken: token },
      include: {
        group: {
          include: {
            createdBy: true,
          },
        },
      },
    });

    if (!groupMember) {
      throw new NotFoundException('Invite not found');
    }

    const inviteLink = `${process.env.APP_URL || 'http://localhost:3000'}/invites/${token}`;

    // Send email if we have the invited email stored
    if (groupMember.invitedEmail) {
      const inviterName =
        groupMember.group.createdBy.firstName &&
        groupMember.group.createdBy.lastName
          ? `${groupMember.group.createdBy.firstName} ${groupMember.group.createdBy.lastName}`
          : groupMember.group.createdBy.username;

      await this.emailService.sendGroupInviteEmail(
        groupMember.invitedEmail,
        groupMember.group.name,
        inviterName,
        token,
      );

      return {
        message: 'Invite email resent successfully',
        inviteLink,
      };
    }

    return {
      message: 'Invite link generated (email not available for older invites)',
      inviteLink,
    };
  }

  private checkInviteExpiration(invitedAt: Date | null): boolean {
    if (!invitedAt) return false;

    const now = new Date();
    const expirationDate = new Date(invitedAt);
    expirationDate.setDate(
      expirationDate.getDate() + this.INVITE_EXPIRATION_DAYS,
    );

    return now > expirationDate;
  }
}
