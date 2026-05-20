-- Add indexes for customers table
CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON customers USING btree (deleted_at);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers USING btree (is_active);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers USING btree (created_at);

-- Add indexes for invoices table
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices USING btree (customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_type ON invoices USING btree (type);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices USING btree (status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_deleted_at ON invoices USING btree (deleted_at);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_type_deleted ON invoices USING btree (customer_id, type, deleted_at);

-- Add indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments USING btree (invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments USING btree (payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_payment_date ON payments USING btree (invoice_id, payment_date);
