CREATE TYPE "editionFormat" AS ENUM('Digital', 'Hardcover', 'Paperback');--> statement-breakpoint
CREATE TABLE "authors" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "authors_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE "books_to_authors" (
	"bookId" integer NOT NULL,
	"authorId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "books_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"originalTitle" varchar(255),
	"seriesId" integer,
	"seriesOrder" integer,
	"coverUrl" varchar(512),
	"description" text
);
--> statement-breakpoint
CREATE TABLE "edition_reading_progress" (
	"user_id" integer,
	"edition_id" integer,
	"locator" varchar(1024) NOT NULL,
	"progress_percentage" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "edition_reading_progress_pkey" PRIMARY KEY("user_id","edition_id")
);
--> statement-breakpoint
CREATE TABLE "editions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "editions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"bookId" integer NOT NULL,
	"publisher" varchar(255),
	"publicationDate" varchar(255),
	"isbn" varchar(255),
	"format" "editionFormat",
	"language" varchar(255),
	"filePath" varchar(512)
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "quotes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"text" varchar(255) NOT NULL,
	"storedBy" integer DEFAULT 0 NOT NULL,
	"public" boolean DEFAULT true NOT NULL,
	"bookId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "series" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "series_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"description" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "books_to_authors" ADD CONSTRAINT "books_to_authors_bookId_books_id_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id");--> statement-breakpoint
ALTER TABLE "books_to_authors" ADD CONSTRAINT "books_to_authors_authorId_authors_id_fkey" FOREIGN KEY ("authorId") REFERENCES "authors"("id");--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_seriesId_series_id_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id");--> statement-breakpoint
ALTER TABLE "edition_reading_progress" ADD CONSTRAINT "edition_reading_progress_edition_id_editions_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "editions"("id");--> statement-breakpoint
ALTER TABLE "editions" ADD CONSTRAINT "editions_bookId_books_id_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id");--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_bookId_books_id_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id");