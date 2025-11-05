import { Args, Query, Resolver } from '@nestjs/graphql';
import { GetReportsFilter } from '../dto/report.dto';
import { Report } from '../schema/report.schema';
import { ReportsService } from '../services/reports.service';
@Resolver()
export class ReportsResolver {
  constructor(private readonly reportsService: ReportsService) {}

  @Query(() => [Report])
  async getReports(@Args('input') input?: GetReportsFilter) {
    return this.reportsService.getReports(input);
  }
}
