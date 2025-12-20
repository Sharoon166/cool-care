CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"type" varchar(20) DEFAULT 'invoice' NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"invoice_date" timestamp DEFAULT now() NOT NULL,
	"customer_id" text,
	"items" jsonb NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"discount_type" varchar(20) DEFAULT 'percentage',
	"discount_value" numeric(10, 2) DEFAULT '0',
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"previous" numeric(10, 2) DEFAULT '0',
	"paid" numeric(10, 2) DEFAULT '0',
	"total_paid" numeric(10, 2) DEFAULT '0',
	"balance" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'draft',
	"converted_to_invoice_id" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_date" timestamp DEFAULT now() NOT NULL,
	"payment_method" varchar(20) NOT NULL,
	"custom_method" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text
);
--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;