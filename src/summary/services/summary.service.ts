import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Subject } from 'src/generated/client';
import { SummaryTypeEnum } from 'src/generated/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { slugify } from 'src/utils/helpers';
import { generateSimpleExcerpt, stripHtmlAndMarkdown } from 'src/utils/search';
import {
  CreateSummaryCaseDto,
  UpdateSummaryCaseDto,
} from '../dto/summary-case.dto';
import {
  CreateSummaryTopicDto,
  SummaryTopicsQueryDto,
  UpdateSummaryTopicDto,
} from '../dto/summary-topic.dto';
import {
  SummarySearchQueryDto,
  SummarySearchResult,
  SummaryTopicSearchResult,
  SummaryCaseSearchResult,
} from '../dto/summary-search.dto';

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
    const topic = await this.prisma.summaryTopic.findFirst({
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
        orderBy: { createdAt: 'asc' }, // when I migrated the data, createdAt was not set correctly
      });

      return topics;
    } catch (error) {
      throw error;
    }
  }

  async createTopic(input: CreateSummaryTopicDto) {
    try {
      const slug = slugify(input.title);
      const existingTopic = await this.prisma.summaryTopic.findFirst({
        where: {
          OR: [{ title: input.title, subjectId: input.subjectId }, { slug }],
        },
      });
      if (existingTopic) {
        throw new BadRequestException(
          'A topic with the same title already exists for this subject.',
        );
      }
      const topic = await this.prisma.summaryTopic.create({
        data: {
          title: input.title,
          subjectId: input.subjectId,
          slug,
          type: input?.type ?? SummaryTypeEnum.Faculty_Summary,
        },
      });
      return topic;
    } catch (error) {
      throw error;
    }
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

  async getCasesByTopicIdOrTopicSlug(topicId: string) {
    try {
      const whereClause: Prisma.SummaryTopicWhereInput = {};
      if (!topicId.includes('-')) {
        whereClause.id = topicId;
      } else {
        whereClause.slug = topicId;
      }
      const topic = await this.prisma.summaryTopic.findFirst({
        where: whereClause,
        include: {
          subject: true,
        },
      });
      if (!topic) {
        throw new NotFoundException(`Summary topic ${topicId} not found`);
      }
      const cases = await this.prisma.summaryCase.findMany({
        where: { topicId },

        orderBy: { ref: 'asc' },
      });

      return {
        ...topic,
        cases,
      };
    } catch (error) {
      throw error;
    }
  }

  async createCase(input: CreateSummaryCaseDto) {
    try {
      const { topicId, question, answer } = input;
      const slug = slugify(question);

      const existingCase = await this.prisma.summaryCase.findFirst({
        where: { topicId, question },
      });
      if (existingCase) {
        throw new BadRequestException(
          'A case with the same question already exists for this topic.',
        );
      }

      const lastReference = await this.prisma.summaryCase.findFirst({
        orderBy: { ref: 'desc' },
      });
      const nextRef = lastReference ? lastReference.ref + 1 : 1;

      const created = await this.prisma.summaryCase.create({
        data: {
          topicId,
          question,
          answer,
          ref: nextRef,
          slug,
        },
      });

      return created;
    } catch (error) {
      throw error;
    }
  }

  async updateCase(input: UpdateSummaryCaseDto) {
    const { id } = input;

    const existingCase = await this.prisma.summaryCase.findUnique({
      where: { id },
    });
    if (!existingCase) {
      throw new NotFoundException(`Summary case ${id} not found`);
    }
    let slug = existingCase.slug;
    if (input.question && input.question !== existingCase.question) {
      slug = slugify(input.question);
    }
    const updatedCase = await this.prisma.summaryCase.update({
      where: { id },
      data: {
        answer: input.answer,
        question: input.question,
        slug,
      },
    });

    return updatedCase;
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

  /**
   * Search across summary topics and cases
   */
  async search(query: SummarySearchQueryDto): Promise<SummarySearchResult> {
    const { q, type, subjectSlug, limit = 20, offset = 0 } = query;

    if (!q || q.trim().length < 2) {
      return { topics: [], cases: [], totalTopics: 0, totalCases: 0 };
    }

    const searchTerm = q.trim();

    // Build base where clause for filtering
    const topicBaseWhere: Prisma.SummaryTopicWhereInput = {};
    const caseBaseWhere: Prisma.SummaryCaseWhereInput = {};

    if (type) {
      topicBaseWhere.type = type;
      caseBaseWhere.topic = { type };
    }

    if (subjectSlug) {
      topicBaseWhere.subject = { slug: subjectSlug };
      if (caseBaseWhere.topic) {
        caseBaseWhere.topic.subject = { slug: subjectSlug };
      }
    }

    // Search topics by title
    const [topics, totalTopics] = await Promise.all([
      this.prisma.summaryTopic.findMany({
        where: {
          ...topicBaseWhere,
          title: { contains: searchTerm, mode: 'insensitive' },
        },
        include: {
          subject: { select: { id: true, name: true, slug: true } },
          _count: { select: { cases: true } },
        },
        take: Math.ceil(limit / 2),
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.summaryTopic.count({
        where: {
          ...topicBaseWhere,
          title: { contains: searchTerm, mode: 'insensitive' },
        },
      }),
    ]);

    // Search cases by question or answer
    const [cases, totalCases] = await Promise.all([
      this.prisma.summaryCase.findMany({
        where: {
          ...caseBaseWhere,
          OR: [
            { question: { contains: searchTerm, mode: 'insensitive' } },
            { answer: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        include: {
          topic: {
            include: {
              subject: { select: { id: true, name: true, slug: true } },
            },
          },
        },
        take: Math.ceil(limit / 2),
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.summaryCase.count({
        where: {
          ...caseBaseWhere,
          OR: [
            { question: { contains: searchTerm, mode: 'insensitive' } },
            { answer: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    // Transform topics
    const topicResults: SummaryTopicSearchResult[] = topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      slug: topic.slug,
      type: topic.type as SummaryTypeEnum,
      subject: topic.subject,
      caseCount: topic._count.cases,
      matchType: 'title' as const,
    }));

    // Transform cases with excerpts
    const caseResults: SummaryCaseSearchResult[] = cases.map((c) => {
      const questionMatch = c.question
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const answerMatch = c.answer
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      let matchType: 'question' | 'answer' | 'both';
      let excerptSource: string;

      if (questionMatch && answerMatch) {
        matchType = 'both';
        excerptSource = c.question;
      } else if (questionMatch) {
        matchType = 'question';
        excerptSource = c.question;
      } else {
        matchType = 'answer';
        excerptSource = stripHtmlAndMarkdown(c.answer);
      }

      return {
        id: c.id,
        question: c.question,
        answer: c.answer,
        slug: c.slug,
        ref: c.ref,
        topic: {
          id: c?.topic?.id as string,
          title: c?.topic?.title as string,
          slug: c?.topic?.slug as string,
          type: c?.topic?.type as SummaryTypeEnum,
          subject: c?.topic?.subject as Subject,
        },
        matchType,
        excerpt: generateSimpleExcerpt(excerptSource, searchTerm, 30),
      };
    });

    return {
      topics: topicResults,
      cases: caseResults,
      totalTopics,
      totalCases,
    };
  }
}
