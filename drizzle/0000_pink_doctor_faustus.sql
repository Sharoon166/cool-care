CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(20) NOT NULL,
	"alternate_phone" varchar(20),
	"address" varchar(255),
	"city" varchar(100),
	"postal_code" varchar(20),
	"company_name" varchar(255),
	"gst_number" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" varchar(20) DEFAULT 'normal',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"age" integer
);
