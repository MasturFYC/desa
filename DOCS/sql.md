# UPGRADE DATABASE

Masuk ke database.. ganti * dengan password.
___
```sh
psql postgres://postgres:********@localhost:5432/sip
```

Copy per baris perintah berikut ke terminal database.
___
```sh
ALTER TABLE customers ADD COLUMN customer_div integer NOT NULL DEFAULT 0;

ALTER TYPE public.cust_type ADD VALUE 'Pabrik';

ALTER TABLE grass ADD COLUMN total_div decimal(12,2) NOT NULL DEFAULT 0;
```

Copy sekaligus perintah berikut:
___
```sh
DROP FUNCTION public.grass_before_insert_update_func;
CREATE OR REPLACE FUNCTION public.grass_before_insert_update_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$

BEGIN

  NEW.total = (NEW.qty * NEW.price) - NEW.total_div;

RETURN NEW;

END; $function$ ;
```
___
```sh
CREATE OR REPLACE FUNCTION public.get_customer_div(customer_id integer)
 RETURNS record
 LANGUAGE plpgsql
AS $function$
        DECLARE ret RECORD;
BEGIN

        SELECT c.customer_div, c.name INTO ret
        FROM customers c
        WHERE c.id = customer_id;

        return ret;

END;
$function$ ;
```

```sh
CREATE OR REPLACE FUNCTION public.grass_after_insert_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$

declare cid integer;
declare cname varchar(50);
declare total decimal(12,2);
declare grass_id integer;
declare cust_id integer;

BEGIN

  total := NEW.total_div;

  if total > 0 then
    grass_id := NEW.id;
    cust_id := NEW.customer_id;

    SELECT a, b into cid, cname from get_customer_div(cust_id) as (a integer, b varchar(50));

    INSERT INTO payments (
      customer_id, descriptions, ref_id, payment_date, total
    ) VALUES (
      cid, concat('Bagi hasil dengan ', cname), grass_id, now(), total
    );
  end if;

  RETURN NEW;

END; $function$ ;
```
___

```sh
CREATE OR REPLACE FUNCTION public.grass_after_update_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare cid integer;
declare cname varchar(50);
declare total decimal(12,2);
declare grass_id integer;
declare cust_id integer;

BEGIN

  total := NEW.total_div;

  if total > 0 then

    UPDATE payments SET total = NEW.total_div
    WHERE ref_id = NEW.id;

    if not found then
      grass_id := NEW.id;
      cust_id := NEW.customer_id;

      SELECT a, b into cid, cname from get_customer_div(cust_id) as (a integer, b varchar(50));

      INSERT INTO payments (
        customer_id, descriptions, ref_id, payment_date, total
      ) VALUES (
        cid, concat('Bagi hasil dengan ', cname), grass_id, now(), total
      );
    end if;
  else
    DELETE FROM payments 
    WHERE ref_id = NEW.id;
  end if;

  RETURN NEW;

END; $function$ ;
```
___
```sh
CREATE OR REPLACE FUNCTION public.grass_after_delete_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$

BEGIN

  DELETE FROM payments 
  WHERE ref_id = OLD.id;

  RETURN OLD;

END; $function$ ;
```
___
```sh
CREATE TRIGGER grass_after_insert_trig 
AFTER INSERT ON grass FOR EACH ROW
EXECUTE FUNCTION grass_after_insert_func();
```
___
```sh
CREATE TRIGGER grass_after_update_trig 
AFTER UPDATE ON grass FOR EACH ROW
EXECUTE FUNCTION grass_after_update_func();
```
___
```sh
CREATE TRIGGER grass_after_delete_trig 
AFTER DELETE ON grass FOR EACH ROW
EXECUTE FUNCTION grass_after_delete_func();
```
____
```sh
CREATE TABLE categories (
  id serial primary key,
  name varchar(50) not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);
```
___
```sh
alter table categories alter column id type smallint;
alter sequence categories_id_seq as smallint;
create unique index iq_category_name on categories(name);

insert into categories (name) values ('Produk Toko'), ('Pertanian');
```
___
```sh

alter table products add column category_id smallint not null default 0;
update products set category_id = 1;
create index ix_category_product on products(category_id);
```
___
```sh

alter table products add constraint fk_category_product
foreign key (category_id) references categories (id) on delete restrict on update cascade;

```