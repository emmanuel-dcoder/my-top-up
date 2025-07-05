import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { envConfig } from 'src/core/config/env.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: `${envConfig.jwt.secret}`,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    return { _id: payload.sub, mobileNumber: payload.mobileNumber };
  }
}
