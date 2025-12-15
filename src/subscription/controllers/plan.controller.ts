import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PlanService } from '../services/plan.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { CreatePlanDTO } from '../dto/plan.dto';

@ApiTags('Plans')
@ApiBearerAuth()
@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}
  @Get()
  getAllPlans() {
    return this.planService.getAllPlans();
  }

  @UseGuards(AuthGuard)
  @Get('paystack')
  getPaystackPlans() {
    return this.planService.getPaystackPlans();
  }

  @Get(':planCode')
  getPlanByCode(planCode: string) {
    return this.planService.getPlanByCode(planCode);
  }

  @UseGuards(AuthGuard)
  @Post()
  createPlan(@Body() input: CreatePlanDTO) {
    return this.planService.createPlan(input);
  }
}
