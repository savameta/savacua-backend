import { Body, Controller, Get, HttpException, HttpStatus, Logger, Post } from '@nestjs/common';
import { user } from '@prisma/client';
import { User } from 'src/decorators/user.decorator';
import { omit } from 'lodash';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LinkAccountMessage, LinkAccountOnChain } from './user.dto';
import * as ethers from 'ethers';
import { UserService } from './user.service';
import { generateSignInMessage } from 'src/_services/util';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}
  private logger = new Logger(UserController.name);
  @ApiBearerAuth()
  @Get('detail')
  async getUserDetail(@User() user: user) {
    return omit(user, ['password', 'token_expiry_date', 'time_send_token', 'salt']);
  }

  @ApiBearerAuth()
  @Post()
  async getLinkAccountMessage(@User() user: user, @Body() body: LinkAccountMessage) {
    if (user.wallet_address) throw new HttpException('You had linked wallet address', HttpStatus.BAD_REQUEST);

    const message = generateSignInMessage(body.wallet_address);
    return {
      status: HttpStatus.ACCEPTED,
      message,
    };
  }

  @ApiBearerAuth()
  @Post('link-account')
  async linkAccountOnChain(@User() user: user, @Body() body: LinkAccountOnChain) {
    if (user.wallet_address) throw new HttpException('You had linked wallet address', HttpStatus.BAD_REQUEST);

    const message = generateSignInMessage(body.wallet_address);

    try {
      const signerAddress = await ethers.verifyMessage(message, body.signature);

      if (signerAddress !== body.wallet_address) throw new HttpException('link account error!', HttpStatus.BAD_REQUEST);

      await this.userService.linkAccount(user.id, signerAddress);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException('Something went wrong!', HttpStatus.BAD_REQUEST);
    }

    return {
      status: HttpStatus.ACCEPTED,
      message: 'Your account has been successfully linked!',
    };
  }
}
