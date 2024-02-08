import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { user, user_token } from '@prisma/client';
import { nanoid } from 'nanoid';
import { PrismaService } from 'nestjs-prisma';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(accessToken: string, userId: string): Promise<user> {
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    let userToken = await this.prisma.user_token.findFirst({
      where: { user_id: userId },
    });
    if (!userToken || userToken.access_token !== accessToken) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async createUserDefault(email: string): Promise<user> {
    return this.prisma.user.create({
      data: {
        username: email, // TODO: update username = email + randomString();
        email: email,
        auth_email_google: email,
        balance: 0,
      },
    });
  }

  getUserFromToken(token: string): Promise<user> {
    const id = this.jwtService.decode(token)['userId'];
    return this.prisma.user.findUnique({ where: { id } });
  }

  generateTokens(payload: { userId: string; role: string }) {
    return this._generateAccessToken(payload);
  }
  private _generateAccessToken(payload: {
    userId: string;
    role: string;
  }): string {
    return this.jwtService.sign(payload);
  }

  private _getTokenByUserId(userId: string): Promise<user_token> {
    return this.prisma.user_token.findUnique({
      where: {
        user_id: userId,
      },
    });
  }

  findUserById(userId: string): Promise<user> {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
  }

  /**
   * Stuff with one argument.
   * @method findUserByEmailOrUsername
   * @param {string} input email or username value
   */
  findUserByEmailOrUsername(input: string): Promise<user> {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: input }, { username: input }],
      },
    });
  }

  createUserTokenByUserId(
    userId: string,
    accessToken: string,
  ): Promise<user_token> {
    return this.prisma.user_token.create({
      data: {
        user_id: userId,
        access_token: accessToken,
      },
    });
  }

  updateUserTokenByUserId(
    userId: string,
    accessToken: string,
  ): Promise<user_token> {
    return this.prisma.user_token.upsert({
      where: {
        user_id: userId,
      },
      update: {
        access_token: accessToken,
      },
      create: {
        user_id: userId,
        access_token: accessToken,
      },
    });
  }
}
