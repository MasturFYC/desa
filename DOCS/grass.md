GRASS TABLE
---
___

```sh
ALTER TABLE grass
    ADD COLUMN product_id
    integer not null default 0;
```

```sh
ALTER TABLE grass
    ADD COLUMN unit_id
    integer not null default 0;
```
```sh
ALTER TABLE grass
    ADD COLUMN real_qty
    decimal(10,2) not null default 0;
```
```sh
ALTER TABLE grass
    ADD COLUMN buy_price
    decimal(12,2) not null default 0;
```
```sh
ALTER TABLE grass
    ADD COLUMN content
    decimal(8,2) not null default 0;
```
```sh
ALTER TABLE grass
    ADD COLUMN unit_name
    varchar(6) not null default '-';
```
```sh
alter table grass
    alter column unit_name
    drop default;
```


```sh
UPDATE grass SET
    product_id = 16;
```
```sh
CREATE INDEX ix_grass_product
    ON grass (product_id);
```
```sh
ALTER TABLE grass
    ADD CONSTRAINT fk_grass_product
    FOREIGN KEY (product_id)
    REFERENCES products (id);
```
```sh
update grass set
    unit_id = 1;
```
```sh
ALTER TABLE grass
    ADD CONSTRAINT fk_grass_unit
    FOREIGN KEY (unit_id)
    REFERENCES units (id);
```
```sh
CREATE OR REPLACE FUNCTION
    grass_after_insert_func()
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

        SELECT a, b into cid, cname 
            from get_customer_div(cust_id) 
            as (a integer, b varchar(50));

        INSERT INTO payments (
            customer_id, descriptions,
            ref_id, payment_date, total
        ) VALUES (
            cid, concat('Bagi hasil dengan ', cname),
            grass_id, now(), total
        );

    end if;

    UPDATE products SET
        stock = stock + NEW.real_qty
        WHERE id = NEW.product_id;

    RETURN NEW;

END; 
$function$
;
```
```sh
CREATE OR REPLACE FUNCTION
    public.grass_after_update_func()
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

    IF total > 0 THEN

        UPDATE payments SET
            total = NEW.total_div
            WHERE ref_id = NEW.id;

        IF NOT FOUND THEN

            grass_id := NEW.id;
                cust_id := NEW.customer_id;

            SELECT a, b INTO cid, cname
                FROM get_customer_div(cust_id)
                AS (a integer, b varchar(50));
            
            INSERT INTO payments (
              customer_id, descriptions,
              ref_id, payment_date, total
            ) VALUES (
              cid, concat('Bagi hasil dengan ', cname),
              grass_id, now(), total
            );

        END IF;

    ELSE

        DELETE FROM payments
            WHERE ref_id = NEW.id;

    END IF;

    IF (OLD.product_id = NEW.product_id) THEN
      
        UPDATE products SET
            stock = stock + NEW.real_qty - OLD.real_qty
            WHERE id = NEW.product_id;

    ELSE

        UPDATE products SET
            stock = stock + NEW.real_qty
            WHERE id = NEW.product_id;

        UPDATE products SET
            stock = stock - OLD.real_qty
            WHERE id = OLD.product_id;

    END IF;

    RETURN NEW;

END; $function$
;
```
```sh
CREATE OR REPLACE FUNCTION
  grass_after_delete_func()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$

BEGIN

  DELETE FROM payments
    WHERE ref_id = OLD.id;

  UPDATE products SET
    stock = stock - OLD.real_qty
    WHERE id = OLD.product_id;

  RETURN OLD;

END; $$
;
```
```sh
CREATE OR REPLACE FUNCTION grass_before_insert_update_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$

BEGIN

    NEW.total = (NEW.qty * NEW.price) - NEW.total_div;
    NEW.real_qty = (NEW.qty * NEW.content);

    RETURN NEW;

END; $function$
;
```
```sh
```
```sh
```
```sh
```
```sh
```