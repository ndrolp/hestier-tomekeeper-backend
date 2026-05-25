ALTER TABLE "quotes" ADD COLUMN "locator" varchar(1024);--> statement-breakpoint
ALTER TABLE "quotes" ALTER COLUMN "text" SET DATA TYPE varchar(500) USING "text"::varchar(500);