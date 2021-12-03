## SPECIAL PAYMENT
___
```sh
CREATE TABLE special_payments (
  customer_id integer NOT NULL,
  order_id integer DEFAULT 0 NOT NULL,
  id integer DEFAULT nextval('public.order_seq'::regclass) NOT NULL,
  pay_num varchar(50) NOT NULL,
  descriptions character varying(128),
  payment_at timestamp without time zone NOT NULL,
  nominal numeric(12,2) DEFAULT 0 NOT NULL
);
```
```sh
ALTER TABLE special_payments
  ADD PRIMARY KEY (id);
```
```sh
CREATE INDEX ix_special_payments_customer_id
  ON special_payments (customer_id);
```
```sh
CREATE INDEX ix_special_payments_order
  ON special_payments (order_id);
```
```sh
ALTER TABLE special_payments
  ADD CONSTRAINT fk_special_payments_customer
  FOREIGN KEY (customer_id)
  REFERENCES customers (id)
  ON DELETE RESTRICT ON UPDATE CASCADE;
```
```sh
ALTER TABLE special_payments
  ADD CONSTRAINT fk_special_payments_order
  FOREIGN KEY (order_id)
  REFERENCES special_orders (id)
  ON DELETE RESTRICT ON UPDATE CASCADE;
```
```sh
CREATE OR REPLACE FUNCTION spo_payment_delete_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$

begin

    UPDATE special_orders SET
      payments = payments - OLD.nominal
      WHERE id = OLD.order_id;

    RETURN OLD;

end;
$function$;
```
```sh
CREATE OR REPLACE FUNCTION spo_payment_aft_insert_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$

begin

    UPDATE special_orders SET
      payments = payments + NEW.nominal
      WHERE id = NEW.order_id;

    RETURN NEW;

end;
$function$;
```
```sh
CREATE OR REPLACE FUNCTION spo_payment_aft_update_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$

begin

    UPDATE special_orders SET
      payments = payments + NEW.nominal - OLD.nominal
      WHERE id = NEW.order_id;

    RETURN NEW;

end;
$function$;
```
```sh
CREATE TRIGGER
  spo_payment_delete_trig AFTER DELETE
  ON special_payments FOR EACH ROW
  EXECUTE FUNCTION spo_payment_delete_func();
```
```sh
CREATE TRIGGER
  spo_payment_aft_insert_trig AFTER INSERT
  ON special_payments FOR EACH ROW
  EXECUTE FUNCTION spo_payment_aft_insert_func();
```
```sh
CREATE TRIGGER
  spo_payment_aft_update_trig AFTER UPDATE OF nominal
  ON special_payments FOR EACH ROW
  EXECUTE FUNCTION spo_payment_aft_update_func();
```