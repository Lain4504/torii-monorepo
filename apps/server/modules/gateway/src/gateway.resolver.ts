import { Args, Query, Resolver } from '@nestjs/graphql';
import { Field, ObjectType } from '@nestjs/graphql';

import {
  AuthHealthResponse,
  GatewayService,
  ValidateTokenResponse,
} from './gateway.service';

@ObjectType()
class AuthHealth {
  @Field()
  service!: string;

  @Field()
  status!: string;
}

@ObjectType()
class ValidateTokenResult {
  @Field()
  isValid!: boolean;
}

@Resolver()
export class GatewayResolver {
  constructor(private readonly gatewayService: GatewayService) {}

  @Query(() => AuthHealth, { name: 'authHealth' })
  authHealth(): Promise<AuthHealthResponse> {
    return this.gatewayService.pingAuth();
  }

  @Query(() => ValidateTokenResult, { name: 'validateToken' })
  validateToken(
    @Args('token', { type: () => String }) token: string,
  ): Promise<ValidateTokenResponse> {
    return this.gatewayService.validateToken(token);
  }
}

