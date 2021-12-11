
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
            from get_customer_div(cust_id) 
            as (a varchar(50));

        INSERT INTO payments (
            customer_id, descriptions, 
            ref_id, payment_date, total
        ) VALUES (
            part_id, concat('Bagi hasil dengan ', cname, '(', to_char(qty, 'L9G999'), ' kg)'),
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
    cust_id := NEW.customer_id;

    IF total_div > 0 THEN

        SELECT a into cname 
        from get_customer_div(cust_id) 
        as (a varchar(50));

        UPDATE payments SET
            total = total_div,
            descriptions = concat('Bagi hasil dengan ', cname, '(', to_char(qty, 'L9G999'), ' kg)'),
            payment_date = pay_date,
            customer_id = part_id
        WHERE ref_id = grass_id;

        IF NOT FOUND THEN
            
            INSERT INTO payments (
                customer_id, descriptions, 
                ref_id, payment_date, total
            ) VALUES (
                part_id, concat('Bagi hasil dengan ', cname, '(', to_char(qty, 'L9G999'), ' kg)'),
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


```sh

CREATE OR REPLACE FUNCTION public.product_get_transaction_detail(prod_id integer)
 RETURNS TABLE(id integer, trx_date character varying, faktur character varying,
 name character varying, real_qty numeric, unit_name character varying, debt numeric,
 cred numeric, saldo numeric)
 LANGUAGE plpgsql
AS $$

begin

    return query with recursive trx as (

        select 0 id, '-'::character varying(10) trx_date,
          'Stock Awal'::character varying(60) faktur, p.name,
          p.first_stock real_qty, p.unit unit_name, p.first_stock debt, 0 cred
        from products p
        where p.id = prod_id

      union all

        select ds.id, to_char(s.stock_date, 'DD-MM-YYYY')::character varying(10) trx_date,
          s.stock_num faktur, sp.name,
          ds.real_qty, ds.unit_name, ds.qty debt, 0 cred
        from stock_details ds
        inner join stocks s on s.id = ds.stock_id
        inner join suppliers sp on sp.id = s.supplier_id
        where ds.product_id = prod_id

        union all

        select gd.id, to_char(g.order_date, 'DD-MM-YYYY')::character varying(10) trx_date,
          concat('PEMBELIAN #', g.id)::character varying (60) faktur, gc.name,
          gd.real_qty, gd.unit_name, gd.qty debt, 0 cred
        from grass_details gd
        inner join grass g on g.id = gd.grass_id
        inner join customers gc on gc.id = g.customer_id
        where gd.product_id = prod_id

        union all

       select d.id, to_char(o.order_date, 'DD-MM-YYYY')::character varying(10) trx_date,
          concat('ORDER #', o.id)::character varying (60) faktur, c.name,
         -d.real_qty, d.unit_name, 0 debt, d.qty cred
        from order_details d
        inner join orders o on o.id = d.order_id
        inner join customers c on c.id = o.customer_id
        where d.product_id = prod_id

        union all

       select sd.id, to_char(so.created_at, 'DD-MM-YYYY')::character varying(10) trx_date,
          so.surat_jalan faktur, sc.name,
         -sd.real_qty, sd.unit_name, 0 debt, sd.qty cred
        from special_details sd
        inner join special_orders so on so.id = sd.order_id
        inner join customers sc on sc.id = so.customer_id
        where sd.product_id = prod_id

    )

    select t.id, t.trx_date, t.faktur, t.name, t.real_qty, t.unit_name,
        t.debt,
        t.cred,
        sum(t.real_qty)
        over (order by t.id rows between unbounded preceding and current row) as saldo
    from trx t
    order by t.id;

end;

$$;

```

```sh
CREATE OR REPLACE FUNCTION public.set_default_unit(prod_id integer, unit_id integer)
    RETURNS boolean
 LANGUAGE plpgsql
AS $$

begin

    update units set is_default = false
    where product_id = prod_id;
    update units set is_default = true
    where product_id = prod_id and id = unit_id;

    return true;

end;
$$;

```

```sh
CREATE OR REPLACE FUNCTION public.od_before_insert_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$

begin

        --raise notice 'value: %', NEW.subtotal;
        NEW.real_qty = NEW.qty * NEW.content;
        NEW.subtotal = NEW.qty * (NEW.price - NEW.discount);

        RETURN NEW;

end; $$;

```
```sh
CREATE OR REPLACE FUNCTION public.lunas_delete_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$

BEGIN

    update orders set
      lunas_id = 0
      where customer_id = OLD.customer_id
      and lunas_id = OLD.id;

    update special_orders set
      lunas_id = 0
      where customer_id = OLD.customer_id
      and lunas_id = OLD.id;

    update payments set
      lunas_id = 0
      where customer_id = OLD.customer_id
      and lunas_id = OLD.id;

    update special_payments set
      lunas_id = 0
      where customer_id = OLD.customer_id
      and lunas_id = OLD.id;

    update kasbons set
      lunas_id = 0
      where customer_id = OLD.customer_id
      and lunas_id = OLD.id;

    update grass set
      lunas_id = 0
      where customer_id = OLD.customer_id
      and lunas_id = OLD.id;

    delete from kasbons
      where ref_lunas_id = OLD.id
      AND customer_id = OLD.customer_id;

    RETURN OLD;

END;
$$;

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
CREATE or replace FUNCTION public.spd_aft_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

    update special_orders set
    total = total + NEW.subtotal - OLD.subtotal
    where id = NEW.order_id;

    if OLD.product_id = NEW.product_id then

      update products set
      stock = stock + OLD.real_qty - NEW.real_qty
      where id = NEW.product_id;
    
    else

      update products set
      stock = stock - NEW.real_qty
      where id = NEW.product_id;

      update products set
      stock = stock + OLD.real_qty
      where id = OLD.product_id;

    end if;

    return NEW;

end;

$$;
```