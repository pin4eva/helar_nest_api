import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { slugify } from 'src/utils/helpers';
import {
  CreateHandbookTopicDto,
  UpdateHandbookTopicDto,
} from '../dto/handbook-topic.dto';
import {
  CreateHandbookCaseDto,
  UpdateHandbookCaseDto,
} from '../dto/handbook-case.dto';
import { TopicTypeEnum } from 'src/generated/enums';

@Injectable()
export class HandbookService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Handbook topics
   */
  listTopics() {
    return this.prisma.handbookTopic.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTopicById(id: string) {
    const topic = await this.prisma.handbookTopic.findUnique({
      where: { id },
      include: { cases: true },
    });

    if (!topic) {
      throw new NotFoundException(`Handbook topic ${id} not found`);
    }

    return topic;
  }

  async getTopicsBySubjectId(subjectId: string) {
    return this.prisma.handbookTopic.findMany({
      where: { subjectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  createTopic(input: CreateHandbookTopicDto) {
    const slug = slugify(input.title);
    return this.prisma.handbookTopic.create({
      data: {
        title: input.title,
        subjectId: input.subjectId,
        slug,
        type: input.type ?? TopicTypeEnum.Handbook,
      },
    });
  }

  async updateTopic(id: string, input: UpdateHandbookTopicDto) {
    const existingTopic = await this.ensureTopicExists(id);
    let slug = existingTopic.slug;
    if (input.title && input.title !== existingTopic.title) {
      slug = slugify(input.title);
    }
    return this.prisma.handbookTopic.update({
      where: { id },
      data: {
        ...input,
        slug,
      },
    });
  }

  async deleteTopic(id: string) {
    await this.ensureTopicExists(id);
    return this.prisma.handbookTopic.delete({ where: { id } });
  }

  /**
   * Handbook cases
   */
  listCases() {
    return this.prisma.handbookCase.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCasesByTopicId(topicId: string) {
    return this.prisma.handbookCase.findMany({
      where: { topicId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCaseById(id: string) {
    const handbookCase = await this.prisma.handbookCase.findUnique({
      where: { id },
    });

    if (!handbookCase) {
      throw new NotFoundException(`Handbook case ${id} not found`);
    }

    return handbookCase;
  }

  async createCase(input: CreateHandbookCaseDto) {
    const { topicId } = input;
    const lastCase = await this.prisma.handbookCase.findFirst({
      where: { topicId },
      orderBy: { ref: 'desc' },
    });
    const nextRef = lastCase ? lastCase.ref + 1 : 1;
    const slug = slugify(`${input.title}-${nextRef}`);
    return this.prisma.handbookCase.create({
      data: {
        title: input.title,
        body: input.body,
        byline: input.byline,
        citation: input.citation,
        topicId: topicId,
        ref: nextRef,
        slug,
      },
    });
  }

  async updateCase(id: string, input: UpdateHandbookCaseDto) {
    const existingCase = await this.ensureCaseExists(id);

    let slug = existingCase.slug;
    if (input.title && input.title !== existingCase.title) {
      slug = slugify(`${input.title}-${existingCase.ref}`);
    }

    return this.prisma.handbookCase.update({
      where: { id },
      data: {
        ...input,
        slug,
      },
    });
  }

  async deleteCase(id: string) {
    await this.ensureCaseExists(id);
    return this.prisma.handbookCase.delete({ where: { id } });
  }

  private async ensureTopicExists(id: string) {
    const topic = await this.prisma.handbookTopic.findUnique({ where: { id } });
    if (!topic) {
      throw new NotFoundException(`Handbook topic ${id} not found`);
    }
    return topic;
  }

  private async ensureCaseExists(id: string) {
    const item = await this.prisma.handbookCase.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Handbook case ${id} not found`);
    }
    return item;
  }
}
