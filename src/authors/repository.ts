import { PrismaClient, Author as PrismaAuthor } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { D1Database } from "@cloudflare/workers-types";
import { Author, AuthorSchema, CreateAuthor, UpdateAuthor } from "./schema";

export interface AuthorRepository {
  allAuthors(): Promise<Author[]>;
  findAuthor(id: number): Promise<Author | null>;
  createAuthor(author: CreateAuthor): Promise<Author>;
  updateAuthor(author: UpdateAuthor): Promise<Author | null>;
  deleteAuthor(id: number): Promise<boolean>;
}

export class PrismaAuthorRepository implements AuthorRepository {
  private prismaClient: PrismaClient;

  constructor(database: D1Database) {
    this.prismaClient = new PrismaClient({
      adapter: new PrismaD1(database),
    });
  }

  private parseFromDB(prismaAuthor: PrismaAuthor): Author | null {
    const authorDBParsed = AuthorSchema.safeParse(prismaAuthor);
    if (!authorDBParsed.success) {
      console.error(authorDBParsed.error);
      return null;
    }
    return authorDBParsed.data;
  }

  async allAuthors(): Promise<Author[]> {
    const authorsDB = await this.prismaClient.author.findMany();
    const authors = authorsDB
      .map((authorDB) => this.parseFromDB(authorDB))
      .filter((author) => author !== null) as Author[];
    return authors;
  }

  async findAuthor(id: number): Promise<Author | null> {
    const authorDB = await this.prismaClient.author.findFirst({
      where: { id },
    });
    if (!authorDB) {
      return null;
    }
    return this.parseFromDB(authorDB);
  }

  async createAuthor(author: CreateAuthor): Promise<Author> {
    const data = { ...author };
    console.info("creating author with data:");
    console.dir(data);
    const authorDB = await this.prismaClient.author.create({ data });
    const newAuthor = this.parseFromDB(authorDB);
    if (!newAuthor) {
      throw new Error("Failed to create author");
    }
    return newAuthor;
  }

  async updateAuthor(author: UpdateAuthor): Promise<Author | null> {
    const data = {
      ...author,
    };
    const updatedAuthorDB = await this.prismaClient.author.update({
      where: { id: author.id },
      data: data,
    });
    const updatedAuthor = this.parseFromDB(updatedAuthorDB);
    if (!updatedAuthor) {
      throw new Error("Failed to update author");
    }
    return updatedAuthor;
  }

  async deleteAuthor(id: number): Promise<boolean> {
    return this.prismaClient.author.delete({ where: { id } }).then(() => {
      return true;
    });
  }
}
