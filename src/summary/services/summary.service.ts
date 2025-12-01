import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { slugify } from 'src/utils/helpers';
import { SummaryTypeEnum } from 'src/generated/enums';
import { Prisma, Subject } from 'src/generated/client';
import {
  CreateSummaryTopicDto,
  SummaryTopicsQueryDto,
  UpdateSummaryTopicDto,
} from '../dto/summary-topic.dto';
import {
  CreateSummaryCaseDto,
  UpdateSummaryCaseDto,
} from '../dto/summary-case.dto';

@Injectable()
export class SummaryService {
  constructor(private readonly prisma: PrismaService) {}

  // Topics
  listTopics() {
    return this.prisma.summaryTopic.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTopicById(id: string) {
    const topic = await this.prisma.summaryTopic.findUnique({
      where: { id },
      include: { cases: true },
    });

    if (!topic) {
      throw new NotFoundException(`Summary topic ${id} not found`);
    }

    return topic;
  }

  async getTopicBySlug(slug: string) {
    const topic = await this.prisma.summaryTopic.findUnique({
      where: { slug },
      include: { cases: true, subject: true },
    });

    if (!topic) {
      throw new NotFoundException(`Summary topic with slug ${slug} not found`);
    }

    return topic;
  }

  async getTopicSubjects(type?: SummaryTypeEnum): Promise<Subject[]> {
    try {
      const whereClause: Prisma.SummaryTopicWhereInput = {};
      if (type) {
        whereClause.type = type;
      }
      const subjects = await this.prisma.summaryTopic.findMany({
        where: whereClause,
        select: {
          subject: true,
        },
        distinct: ['subjectId'],
      });
      return subjects.map((item) => item.subject);
    } catch (error) {
      throw error;
    }
  }

  async getTopicsBySubjectSlug(query: SummaryTopicsQueryDto) {
    const { type, search, subjectSlug } = query;
    try {
      const whereClause: Prisma.SummaryTopicWhereInput = {};
      if (subjectSlug) {
        whereClause.subject = { slug: subjectSlug };
      }
      if (type) {
        whereClause.type = type;
      }
      if (search) {
        whereClause.subject = undefined; // reset subject filter to avoid conflict
        whereClause.type = undefined; // reset type filter to avoid conflict
        whereClause.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          {
            cases: {
              some: { question: { contains: search, mode: 'insensitive' } },
            },
          },
          {
            cases: {
              some: { answer: { contains: search, mode: 'insensitive' } },
            },
          },
        ];
      }
      const topics = await this.prisma.summaryTopic.findMany({
        where: whereClause,
        include: {
          subject: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { cases: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return topics;
    } catch (error) {
      throw error;
    }
  }

  createTopic(input: CreateSummaryTopicDto) {
    const slug = slugify(input.title);
    return this.prisma.summaryTopic.create({
      data: {
        title: input.title,
        subjectId: input.subjectId,
        slug,
        type: input.type ?? SummaryTypeEnum.Faculty_Summary,
      },
    });
  }

  async updateTopic(id: string, input: UpdateSummaryTopicDto) {
    await this.ensureTopicExists(id);
    const slug = input.title ? slugify(input.title) : undefined;

    return this.prisma.summaryTopic.update({
      where: { id },
      data: {
        ...input,
        ...(slug ? { slug } : {}),
      },
    });
  }

  async deleteTopic(id: string) {
    await this.ensureTopicExists(id);
    return this.prisma.summaryTopic.delete({ where: { id } });
  }

  // Cases
  listCases() {
    return this.prisma.summaryCase.findMany({
      orderBy: { ref: 'asc' },
    });
  }

  async getCaseById(id: string) {
    const summaryCase = await this.prisma.summaryCase.findUnique({
      where: { id },
    });

    if (!summaryCase) {
      throw new NotFoundException(`Summary case ${id} not found`);
    }

    return summaryCase;
  }

  async getCasesByTopicId(topicId: string) {
    return this.prisma.summaryCase.findMany({
      where: { topicId },
      include: {
        topic: {
          include: { subject: true },
        },
      },
      orderBy: { ref: 'asc' },
    });
  }

  createCase(input: CreateSummaryCaseDto) {
    const slug =
      input.slug?.trim() || slugify(`${input.question}-${input.ref}`);
    return this.prisma.summaryCase.create({
      data: {
        topicId: input.topicId,
        question: input.question,
        answer: input.answer,
        ref: input.ref,
        slug,
      },
    });
  }

  async updateCase(id: string, input: UpdateSummaryCaseDto) {
    await this.ensureCaseExists(id);
    const slug = input.question
      ? slugify(`${input.question}-${input.ref ?? ''}`)
      : undefined;

    return this.prisma.summaryCase.update({
      where: { id },
      data: {
        ...input,
        ...(slug ? { slug } : {}),
      },
    });
  }

  async deleteCase(id: string) {
    await this.ensureCaseExists(id);
    return this.prisma.summaryCase.delete({ where: { id } });
  }

  private ensureTopicExists(id: string) {
    return this.prisma.summaryTopic
      .findUnique({ where: { id } })
      .then((topic) => {
        if (!topic) {
          throw new NotFoundException(`Summary topic ${id} not found`);
        }
        return topic;
      });
  }

  private ensureCaseExists(id: string) {
    return this.prisma.summaryCase
      .findUnique({ where: { id } })
      .then((item) => {
        if (!item) {
          throw new NotFoundException(`Summary case ${id} not found`);
        }
        return item;
      });
  }
}
