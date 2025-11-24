import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { slugify } from '../../utils/helpers';
import { CreateSubjectDTO, UpdateSubjectDTO } from '../dto/subject.dto';

@Injectable()
export class SubjectService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllSubjects() {
    return this.prisma.subject.findMany();
  }

  async createSubject(input: CreateSubjectDTO) {
    try {
      const { name, intro } = input;
      const slug = slugify(name);
      const existingSubject = await this.prisma.subject.findFirst({
        where: {
          OR: [{ name: { equals: name, mode: 'insensitive' } }, { slug }],
        },
      });
      if (existingSubject) {
        throw new Error('Subject already exists');
      }
      const createdSubject = await this.prisma.subject.create({
        data: {
          name,
          intro,
          slug,
        },
      });
      return createdSubject;
    } catch (error) {
      throw error;
    }
  }

  async updateSubject(input: UpdateSubjectDTO) {
    try {
      const { id, name, intro } = input;

      const existingSubject = await this.prisma.subject.findFirst({
        where: {
          id,
        },
      });
      if (!existingSubject) {
        throw new BadRequestException('Subject does not exist');
      }
      let slug = existingSubject.slug;
      if (name && name !== existingSubject.name) {
        slug = slugify(name);
      }
      const updatedSubject = await this.prisma.subject.update({
        where: { id },
        data: {
          name,
          intro,
          slug,
        },
      });
      return updatedSubject;
    } catch (error) {
      throw error;
    }
  }

  async getSubjectById(id: string) {
    try {
      const subject = await this.prisma.subject.findUnique({
        where: { id },
      });
      if (!subject) {
        throw new BadRequestException('Subject not found');
      }
      return subject;
    } catch (error) {
      throw error;
    }
  }

  async getSubjectBySlug(slug: string) {
    try {
      const subject = await this.prisma.subject.findFirst({
        where: { slug },
      });
      if (!subject) {
        throw new BadRequestException('Subject not found');
      }
      return subject;
    } catch (error) {
      throw error;
    }
  }

  async deleteSubject(id: string) {
    try {
      const existingSubject = await this.prisma.subject.findUnique({
        where: { id },
      });
      if (!existingSubject) {
        throw new BadRequestException('Subject does not exist');
      }
      await this.prisma.subject.delete({
        where: { id },
      });
      return { message: 'Subject deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
}
