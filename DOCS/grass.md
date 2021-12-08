
```sh
alter table grass drop column price;
alter table grass drop column product_id;
alter table grass drop column unit_id;
alter table grass drop column buy_price;
alter table grass drop column content;
alter table grass drop column unit_name;
alter table grass drop column real_qty;
alter table grass add column partner_id integer not null default 0;
drop trigger grass_before_insert_update_trig on grass;
drop function grass_before_insert_update_func;
drop table grass_details;
alter table customers drop column customer_div;
```
```sh
CREATE OR REPLACE FUNCTION public.get_customer_div(customer_id integer)
 RETURNS record
 LANGUAGE plpgsql
AS $$
        DECLARE ret RECORD;
BEGIN

        SELECT c.name INTO ret
        FROM customers c
        WHERE c.id = customer_id;

        return ret;

END;
$$
```
```sh
CREATE TABLE public.grass_details (
    grass_id integer NOT NULL,
    id integer DEFAULT nextval('public.order_detail_seq'::regclass) NOT NULL,
    unit_id integer NOT NULL,
    qty numeric(10,2) DEFAULT 0 NOT NULL,
    content numeric(8,2) DEFAULT 0 NOT NULL,
    unit_name character varying(6) NOT NULL,
    real_qty numeric(10,2) DEFAULT 0 NOT NULL,
    price numeric(12,2) DEFAULT 0 NOT NULL,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    buy_price numeric(12,2) DEFAULT 0 NOT NULL,
    product_id integer NOT NULL
);
```
```sh
alter table grass_details
    add primary key (id);
create index ix_grass_details
    on grass_details(grass_id);
create index ix_grass_detail_product
    on grass_details(product_id);
create index ix_grass_detail_unit
    on grass_details(unit_id);
alter table grass_details add constraint fk_grass_details
    foreign key (grass_id) references grass (id)
    on delete restrict on update cascade;
alter table grass_details add constraint fk_grass_detail_product
    foreign key (product_id) references products (id)
    on delete restrict on update cascade;
alter table grass_details add constraint fk_grass_detail_unit
    foreign key (unit_id) references units (id)
    on delete restrict on update cascade;
```
```sh
CREATE OR REPLACE FUNCTION public.grass_detail_after_insert_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$

begin

    update products set
        stock = stock + NEW.real_qty
        where id = NEW.product_id;

    update grass set
        qty = qty + NEW.real_qty,
        total = total + NEW.subtotal 
    WHERE id = NEW.grass_id;

    RETURN NEW;

end; $$;
```
```sh
CREATE OR REPLACE FUNCTION public.grass_detail_after_update_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$

begin

    if NEW.product_id = OLD.product_id then
        update products set
            stock = stock + NEW.real_qty - OLD.real_qty
            where id = NEW.product_id;
    else
        update products set
            stock = stock + NEW.real_qty
            where id = NEW.product_id;

        update products set
            stock = stock - OLD.real_qty
            where id = OLD.product_id;

    end if;

    update grass set
        qty = qty + NEW.real_qty - OLD.real_qty,
        total = total + NEW.subtotal - OLD.subtotal
    WHERE id = NEW.grass_id;

    RETURN NEW;

end; $$;
```
```sh
CREATE OR REPLACE FUNCTION public.grass_detail_after_delete_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$

begin

    update products set
        stock = stock - OLD.real_qty
        where id = OLD.product_id;

    update grass set
        qty = qty - OLD.real_qty,
        total = total - OLD.subtotal
    WHERE id = NEW.grass_id;


    RETURN OLD;

end; $$;
```
```sh
CREATE OR REPLACE FUNCTION public.grass_detail_before_insert_update_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$

BEGIN

    NEW.real_qty = NEW.qty * NEW.content;
    NEW.subtotal = NEW.qty * NEW.price;

    RETURN NEW;

END; $$;
```
```sh

create trigger grass_detail_before_insert_trig
    before insert or update on grass_details for each row
    execute function grass_detail_before_insert_update_func();
create trigger grass_detail_after_insert_trig
    after insert on grass_details for each row
    execute function grass_detail_after_insert_func();
create trigger grass_detail_after_update_trig
    after update on grass_details for each row
    execute function grass_detail_after_update_func();
create trigger grass_detail_after_delete_trig
    after delete on grass_details for each row
    execute function grass_detail_after_delete_func();
```
```sh
CREATE OR REPLACE FUNCTION public.grass_after_delete_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    DELETE FROM payments WHERE
        ref_id = OLD.id;

  RETURN OLD;

END; $$;
```
```sh
CREATE OR REPLACE FUNCTION public.grass_after_insert_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

    declare cname varchar(50);
    declare total_div decimal(12,2);
    declare qty decimal(10,2);
    declare grass_id integer;
    declare cust_id integer;
    declare part_id integer;
    declare pay_date timestamp with time zone;

BEGIN

    total_div := NEW.total_div;
    grass_id := NEW.id;
    cust_id := NEW.customer_id;
    qty := NEW.qty;
    pay_date := NEW.order_date;
    part_id := NEW.partner_id;

    if total_div > 0 then

        SELECT a into cname 
            from get_customer_div(customer_id) 
            as (a varchar(50));

        INSERT INTO payments (
            customer_id, descriptions, 
            ref_id, payment_date, total
        ) VALUES (
            part_id, concat('Bagi hasil dengan ', cname, ' (', qty, ' kg)'),
            grass_id, pay_date, total_div
        );

    end if;

    RETURN NEW;

END; 
$$;
```
```sh
CREATE or replace FUNCTION public.grass_after_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

    declare cname varchar(50);
    declare total_div decimal(12,2);
    declare qty decimal(10,2);
    declare grass_id integer;
    declare cust_id integer;
    declare part_id integer;
    declare pay_date timestamp with time zone;

BEGIN

    total_div := NEW.total_div;
    qty := NEW.qty;
    pay_date := NEW.order_date;
    grass_id := NEW.id;
    part_id := NEW.partner_id;

    IF total > 0 THEN

        SELECT a into cname 
        from get_customer_div(customer_id) 
        as (a varchar(50));

        UPDATE payments SET
            total = total_div,
            descriptions = concat('Bagi hasil dengan ', cname, ' (', qty, ' kg)'),
            payment_date = pay_date,
            customer_id = part_id
        WHERE ref_id = grass_id;

        IF NOT FOUND THEN
            
            INSERT INTO payments (
                customer_id, descriptions, 
                ref_id, payment_date, total
            ) VALUES (
                part_id, concat('Bagi hasil dengan ', cname, ' (', qty, ' kg)'),
                grass_id, pay_date, total_div
            );

        END IF;

    ELSE

        DELETE FROM payments
            WHERE ref_id = NEW.id;

    END IF;

    RETURN NEW;

END; $$;
```