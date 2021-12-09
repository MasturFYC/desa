
```sh
alter table grass drop column price;
alter table grass drop column product_id;
alter table grass drop column unit_id;
alter table grass drop column buy_price;
alter table grass drop column content;
alter table grass drop column unit_name;
alter table grass drop column real_qty;
alter table grass add column partner_id integer not null default 0;
alter table special_orders add column surat_jalan varchar(50) not null default '-';
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
$$;
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
            from get_customer_div(cust_id) 
            as (a varchar(50));

        INSERT INTO payments (
            customer_id, descriptions, 
            ref_id, payment_date, total
        ) VALUES (
            part_id, concat('Bagi hasil dengan ', cname, ' (', to_char(qty, 'L9G999'), '-kg)'),
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
            descriptions = concat('Bagi hasil dengan ', cname, ' (', to_char(qty, 'L9G999'), ' kg)'),
            payment_date = pay_date,
            customer_id = part_id
        WHERE ref_id = grass_id;

        IF NOT FOUND THEN
            
            INSERT INTO payments (
                customer_id, descriptions, 
                ref_id, payment_date, total
            ) VALUES (
                part_id, concat('Bagi hasil dengan ', cname, ' (', to_char(qty, 'L9G999'), ' kg)'),
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
CREATE OR REPLACE FUNCTION public.customer_get_transaction_detail(cust_id integer, lunasid integer)
 RETURNS TABLE(
        id integer,
        idx integer,
        trx_date timestamp without time zone,
        descriptions character varying,
        title character varying,
        qty numeric,
        unit character varying,
        price numeric,
        debt numeric,
        cred numeric,
        saldo numeric)
    LANGUAGE plpgsql
AS $$

begin

    return query with recursive trx as (

        select k.id, 1 idx, k.kasbon_date trx_date,
        k.descriptions, concat('Kasbon #', k.id)::character varying title,
        0 qty, '-'::varchar(6) unit, 0 price,
        k.total debt, 0 cred
        from kasbons k
        where k.customer_id = cust_id
        AND k.lunas_id = lunasid

        union all

        select d.order_id id, 2 idx, od.order_date trx_date,
          pr.name descriptions, concat('Piutang Barang #', d.order_id) title,
          d.qty, d.unit_name unit, d.price,
          d.subtotal debt, 0 cred
        from order_details d
        inner join products pr on pr.id = d.product_id
        inner join orders od on od.id = d.order_id
        where od.customer_id = cust_id
        AND od.lunas_id = lunasid

        union all

        select s.id, 3 idx, s.order_date trx_date,
          s.descriptions, concat('DP Piutang Barang: #', s.id) title,
          0 qty, '-'::varchar(6) unit, 0 price,
          0 debt, s.payment cred
        from orders s
        where s.customer_id = cust_id and s.payment > 0
        AND s.lunas_id = lunasid

        union all

      select g.id, 4 idx, g.order_date trx_date,
        gp.name descriptions, concat('Pembelian: #', g.id ) title,
        gd.qty, gd.unit_name unit, gd.price price,
        0::numeric debt,
        gd.subtotal cred
        from grass_details gd
        inner join products gp on gp.id = gd.product_id
        inner join grass g on g.id = gd.grass_id
        where g.customer_id = cust_id
        AND g.lunas_id = lunasid

      union all

      select pmt.id, 5 idx, pmt.payment_date trx_date,
        pmt.descriptions, concat('Angsuran: #', pmt.id) title,
        0 qty, '-'::varchar(6) unit, 0 price,
        0::numeric debt,
        pmt.total cred
        from payments pmt
        where pmt.customer_id = cust_id
        AND pmt.lunas_id = lunasid

    )

    select t.id, t.idx, t.trx_date,
        t.descriptions, t.title, t.qty, t.unit, t.price,
        t.debt,
        t.cred,
        sum(t.debt - t.cred)
        over (order by t.id, t.idx rows between unbounded preceding and current row) as saldo
    from trx t
    order by t.id, t.idx;

end;

$$;
```

```sh

CREATE OR REPLACE FUNCTION public.customer_get_transaction_detail(cust_id integer, lunasid integer)
RETURNS TABLE(id integer, idx integer, trx_date timestamp without time zone,
    descriptions character varying, title character varying, qty numeric,
    unit character varying, price numeric, debt numeric, cred numeric, saldo numeric)
 LANGUAGE plpgsql
AS $$

begin

    return query with recursive trx as (

        select k.id, 1 idx, k.kasbon_date trx_date,
        k.descriptions, concat('Kasbon #', k.id)::character varying title,
        0 qty, '-'::varchar(6) unit, 0 price,
        k.total debt, 0 cred
        from kasbons k
        where k.customer_id = cust_id
        AND k.lunas_id = lunasid

        union all

        select d.order_id id, 2 idx, od.order_date trx_date,
          pr.name descriptions, concat('Piutang Barang #', d.order_id) title,
          d.qty, d.unit_name unit, d.price,
          d.subtotal debt, 0 cred
        from order_details d
        inner join products pr on pr.id = d.product_id
        inner join orders od on od.id = d.order_id
        where od.customer_id = cust_id
        AND od.lunas_id = lunasid

        union all
      select s.id, 3 idx, s.order_date trx_date,
          s.descriptions, concat('DP Piutang Barang: #', s.id) title,
          0 qty, '-'::varchar(6) unit, 0 price,
          0 debt, s.payment cred
        from orders s
        where s.customer_id = cust_id and s.payment > 0
        AND s.lunas_id = lunasid

        union all

      select g.id, 4 idx, g.order_date trx_date,
        gp.name descriptions, concat('Pembelian: #', g.id ) title,
        gd.qty, gd.unit_name unit, gd.price price,
        0::numeric debt,
        gd.subtotal - (gd.subtotal * (g.total_div / g.total)) cred
        from grass_details gd
        inner join products gp on gp.id = gd.product_id
        inner join grass g on g.id = gd.grass_id
        where g.customer_id = cust_id
        AND g.lunas_id = lunasid

      union all
    select pmt.id, 5 idx, pmt.payment_date trx_date,
        pmt.descriptions, concat('Angsuran: #', pmt.id) title,
        0 qty, '-'::varchar(6) unit, 0 price,
        0::numeric debt,
        pmt.total cred
        from payments pmt
        where pmt.customer_id = cust_id
        AND pmt.lunas_id = lunasid

    )

    select t.id, t.idx, t.trx_date,
        t.descriptions, t.title, t.qty, t.unit, t.price,
        t.debt,
        t.cred,
        sum(t.debt - t.cred)
        over (order by t.id, t.idx rows between unbounded preceding and current row) as saldo
    from trx t
    order by t.id, t.idx;

end;

$$;

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