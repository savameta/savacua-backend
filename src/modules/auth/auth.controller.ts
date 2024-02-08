import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { user_token } from '@prisma/client';
import { Public } from 'src/decorators/public.decorator';
import { GoogleTokenDto } from './dto/auth.dto';
import { AuthService } from './services/auth.service';
import { GoogleAuthenticationService } from './services/google-auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthenticationService: GoogleAuthenticationService,
  ) {}

  @Public()
  @Post('/login-with-google')
  async loginWithGoogle(@Body() payload: GoogleTokenDto) {
    let userToken: user_token;

    const tokenInfo = await this.googleAuthenticationService.authenticate(
      payload.token,
    );
    const user = await this.authService.findUserByEmailOrUsername(
      tokenInfo.email,
    );

    if (!user) {
      const newUser = await this.authService.createUserDefault(tokenInfo.email);
      const accessToken = await this.authService.generateTokens({
        userId: newUser.id,
        role: newUser.role,
      });
      userToken = await this.authService.createUserTokenByUserId(
        newUser.id,
        accessToken,
      );
    } else {
      userToken = await this.authService.updateUserTokenByUserId(
        user.id,
        await this.authService.generateTokens({
          userId: user.id,
          role: user.role,
        }),
      );
    }

    return {
      accessToken: userToken.access_token,
    };
  }
}
