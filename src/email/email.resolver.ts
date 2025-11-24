import {
  Args,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from '@nestjs/graphql';
import { EmailService } from './email.service';

@InputType()
class ActivationEmailInput {
  @Field()
  to!: string;

  @Field()
  name!: string;

  @Field()
  activationLink!: string;
}

@InputType()
class ForgotPasswordEmailInput {
  @Field()
  to!: string;

  @Field()
  name!: string;

  @Field()
  resetLink!: string;
}

@InputType()
class WelcomeEmailInput {
  @Field()
  to!: string;

  @Field()
  name!: string;

  @Field()
  dashboardLink!: string;
}

@ObjectType()
class EmailMutationResponse {
  @Field()
  ok!: boolean;
}

@Resolver()
export class EmailResolver {
  constructor(private readonly emailService: EmailService) {}

  @Mutation(() => EmailMutationResponse)
  async sendActivationEmail(
    @Args('payload') payload: ActivationEmailInput,
  ): Promise<EmailMutationResponse> {
    await this.emailService.sendActivationEmail(payload);
    return { ok: true };
  }

  @Mutation(() => EmailMutationResponse)
  async sendForgotPasswordEmail(
    @Args('payload') payload: ForgotPasswordEmailInput,
  ): Promise<EmailMutationResponse> {
    await this.emailService.sendForgotPasswordEmail(payload);
    return { ok: true };
  }

  @Mutation(() => EmailMutationResponse)
  async sendWelcomeEmail(
    @Args('payload') payload: WelcomeEmailInput,
  ): Promise<EmailMutationResponse> {
    await this.emailService.sendWelcomeEmail(payload);
    return { ok: true };
  }
}
