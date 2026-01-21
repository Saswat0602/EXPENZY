import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from './jwt-payload.interface';
import * as bcrypt from 'bcrypt';

export interface UserWithoutPassword {
  id: string;
  email: string;
  username: string;
  [key: string]: unknown;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) { }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.usersService.findByEmail(email);
    if (
      user &&
      user.passwordHash &&
      (await bcrypt.compare(password, user.passwordHash))
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  login(user: UserWithoutPassword) {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      userId: user.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(email: string, username: string, password: string) {
    const user = await this.usersService.create({
      email,
      username,
      password,
    });

    // Auto-link any pending group invitations for this email
    await this.prisma.groupMember.updateMany({
      where: {
        invitedEmail: email,
        inviteStatus: 'pending',
        userId: null,
      },
      data: {
        userId: user.id,
        inviteStatus: 'accepted',
        joinedAt: new Date(),
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return this.login(result);
  }
}
