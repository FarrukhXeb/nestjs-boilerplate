import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
  async signup(dto: AuthDto) {
    // generate the password
    const hash = await argon.hash(dto.password);
    // save the new user in the db and return it
    try {
      const user = await this.prismaService.user.create({
        data: {
          email: dto.email,
          password: hash,
          isAdmin: dto.isAdmin,
        },
      });
      delete user.password;
      return this.signToken(user.id, user.email, user.isAdmin);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }
  async signin(dto: AuthDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Credentials incorrect');
    const pwdMatches = await argon.verify(user.password, dto.password);
    if (!pwdMatches) throw new ForbiddenException('Credentials incorrect');
    delete user.password;
    return this.signToken(user.id, user.email, user.isAdmin);
  }

  async signToken(
    userId: number,
    email: string,
    isAdmin: boolean,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
      isAdmin,
    };
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    });
    return {
      access_token,
    };
  }
}
