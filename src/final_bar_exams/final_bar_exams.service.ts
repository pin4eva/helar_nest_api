import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBarExamDto, UpdateBarExamDto } from './final_bar_exams.dto';
import { User } from 'src/generated/client';

@Injectable()
export class FinalBarExamsService {
  private readonly logger = new Logger(FinalBarExamsService.name);
  constructor(private readonly prisma: PrismaService) {}

  // Create a new final bar exam question and answer
  async create(input: CreateBarExamDto, user: User) {
    try {
      const { subjectId, question, answer, year, questionType } = input;
      const existingSubject = await this.prisma.subject.findUnique({
        where: { id: subjectId },
      });
      if (!existingSubject) {
        throw new NotFoundException(
          `Subject with ID ${subjectId} does not exist`,
        );
      }

      const existingQA = await this.prisma.finalBarExamQA.findFirst({
        where: {
          subjectId,
          question,
        },
      });
      if (existingQA) {
        throw new BadRequestException(
          `A question with the same text already exists for this subject`,
        );
      }

      const newQA = await this.prisma.finalBarExamQA.create({
        data: {
          subjectId,
          question,
          answer,
          year,
          questionType,
          createdBy: user?.firstName + ' ' + user?.lastName || 'admin',
        },
        include: { subject: { select: { id: true, name: true } } },
      });
      return newQA;
    } catch (error) {
      this.logger.error(error?.['message'] || error);
      throw error;
    }
  }

  // Get all final bar exam questions and answers
  async findAll() {
    try {
      const allQAs = await this.prisma.finalBarExamQA.findMany({
        include: { subject: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      console.log(allQAs);
      return allQAs;
    } catch (error) {
      this.logger.error(error?.['message'] || error);
      throw error;
    }
  }

  async getBarExamQAsByYear(year: number) {
    try {
      const qa = await this.prisma.finalBarExamQA.findFirst({
        where: { year },
        include: { subject: { select: { id: true, name: true } } },
      });
      return qa;
    } catch (error) {
      this.logger.error(error?.['message'] || error);
      throw error;
    }
  }

  async findAllSubjectsWithQnA() {
    try {
      const subjects = await this.prisma.subject.findMany({
        where: {
          finalBarExamQAs: {
            some: {},
          },
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              finalBarExamQAs: true,
            },
          },
        },
      });

      return subjects.map((subject) => ({
        id: subject.id,
        name: subject.name,
        exams: subject._count.finalBarExamQAs,
      }));
    } catch (error) {
      this.logger.error(error?.['message'] || error);
      throw error;
    }
  }
  // Get a specific final bar exam question and answer by ID
  async findOne(id: string) {
    try {
      const existingQA = await this.prisma.finalBarExamQA.findUnique({
        where: { id },
      });
      if (!existingQA) {
        throw new NotFoundException(
          `Final bar exam question and answer with ID ${id} does not exist`,
        );
      }
      return existingQA;
    } catch (error) {
      this.logger.error(error?.['message'] || error);
      throw error;
    }
  }

  // Update a specific final bar exam question and answer by ID
  async update(input: UpdateBarExamDto, user: User) {
    try {
      const { id, subjectId, question, answer, year, questionType } = input;
      const existingQA = await this.prisma.finalBarExamQA.findUnique({
        where: { id },
      });
      if (!existingQA) {
        throw new NotFoundException(
          `Final bar exam question and answer with ID ${id} does not exist`,
        );
      }

      const updatedQA = await this.prisma.finalBarExamQA.update({
        where: { id },
        data: {
          subjectId: subjectId || existingQA.subjectId,
          question: question || existingQA.question,
          answer: answer || existingQA.answer,
          questionType: questionType || existingQA.questionType,
          updatedBy: user?.firstName + ' ' + user?.lastName || 'admin',
          year: year || existingQA.year,
        },
      });
      return updatedQA;
    } catch (error) {
      this.logger.error(error?.['message'] || error);
      throw error;
    }
  }

  // Delete a specific final bar exam question and answer by ID
  async delete(id: string) {
    try {
      const existingQA = await this.prisma.finalBarExamQA.findUnique({
        where: { id },
      });
      if (!existingQA) {
        throw new NotFoundException(
          `Final bar exam question and answer with ID ${id} does not exist`,
        );
      }
      await this.prisma.finalBarExamQA.delete({ where: { id } });
      return {
        message: `Final bar exam question and answer with ID ${id} has been deleted`,
      };
    } catch (error) {
      this.logger.error(error?.['message'] || error);
      throw error;
    }
  }
}
