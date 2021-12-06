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
```sh
drop function special_piutang_balance_func;
```
```sh
CREATE OR REPLACE FUNCTION
  public.special_piutang_balance_func(cust_id integer, lunasid integer)
  RETURNS TABLE(id smallint, descriptions varchar(128),
  debt numeric, cred numeric, saldo numeric) LANGUAGE plpgsql

AS $function$

begin

  return query with recursive trx as (

    select 1::smallint id,
      'Piutang Dagang'::varchar(128) descriptions,
      coalesce(sum(p.total),0) debt,
      coalesce(sum(p.cash),0) cred
    from special_orders p
    where p.customer_id = cust_id
    and p.lunas_id = lunasid

    union all

    select 2::smallint id,
      'Angsuran'::varchar(128) descriptions,
      0::numeric debt, coalesce(sum(a.nominal),0) cred
    from special_payments a
    where a.customer_id = cust_id
    and a.lunas_id = lunasid

  )
  select t.id, t.descriptions, t.debt, t.cred,
    sum(t.debt - t.cred) over (order by t.id
    rows between unbounded preceding and current row) as saldo
  from trx as t;

end;

$function$;
```
### Test
```sh
select * from special_piutang_balance_func(3,0);
```
```sh
drop function special_customer_get_balance;
```
```sh
CREATE OR REPLACE FUNCTION public.special_customer_get_balance(cust_id integer, lunasid integer)
 RETURNS TABLE(
  id integer,
  customer_id integer,
  descriptions character varying,
  trx_date timestamp without time zone,
  debt numeric,
  cred numeric,
  saldo numeric) LANGUAGE plpgsql
AS $function$

begin

    return query with recursive trx as (

        select o.id, o.customer_id,
          coalesce(o.descriptions, concat('ORDER ID#: '::VARCHAR(50), o.id)) descriptions,
          o.created_at trx_date,
          o.total debt,
          o.cash cred
        from special_orders o
        where o.customer_id = cust_id
        and o.lunas_id = lunasid

        union all

        select k.id, k.customer_id,
          k.pay_num,
          k.payment_at trx_date,
          0::numeric debt,
          k.nominal cred
        from special_payments k
        where k.customer_id = cust_id
        and k.lunas_id = lunasid
    )

    select t.id, t.customer_id, t.descriptions, t.trx_date,
        t.debt,
        t.cred,
        sum(t.debt - t.cred)
        over (order by t.id rows between unbounded preceding and current row) as saldo
    from trx t
    order by t.id;

end;

$function$;
```

### Test
```sh
select * from special_customer_get_balance(3,0);
```