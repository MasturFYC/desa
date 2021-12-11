--
-- PostgreSQL database dump
--

-- Dumped from database version 13.5 (Ubuntu 13.5-2.pgdg20.04+1)
-- Dumped by pg_dump version 13.5 (Ubuntu 13.5-2.pgdg20.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: cust_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.cust_type AS ENUM (
    'Bandeng',
    'Rumput Laut',
    'Pabrik'
);


ALTER TYPE public.cust_type OWNER TO postgres;

--
-- Name: customer_get_special_transaction(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.customer_get_special_transaction(cust_id integer, lunasid integer) RETURNS TABLE(id integer, idx integer, trx_date timestamp without time zone, descriptions character varying, qty numeric, unit character varying, price numeric, debt numeric, cred numeric, saldo numeric)
    LANGUAGE plpgsql
    AS $$

begin

    return query with recursive trx as (

        select 1 idx, d.order_id id, o.created_at trx_date,
          concat('Order #', d.order_id, ', ', p.name)::character varying descriptions,
          d.qty qty, d.unit_name unit, d.price,
          d.subtotal debt, 0 cred
        from special_details d
        inner join products p on p.id = d.product_id
        inner join special_orders o on o.id = d.order_id
        where o.customer_id = cust_id
        and o.lunas_id = lunasid

        union all

        select 2 idx, s.id, s.created_at trx_date,
          coalesce(s.descriptions, concat('DP ORDER ID: #', s.id)) descriptions,
          0 qty, '-'::varchar(6) unit, 0 price,
          0::numeric debt, s.cash cred
        from special_orders s
        where s.customer_id = cust_id and s.cash > 0
        and s.lunas_id = lunasid

        union all

        select 3 idx, k.order_id id, k.payment_at trx_date,
          concat('Angsuran #', order_id,', ', k.pay_num) descriptions,
          0 qty, '-'::varchar(6) unit, 0 price,
          0::numeric debt, k.nominal cred
        from special_payments k
        where k.customer_id = cust_id
        and k.lunas_id = lunasid

    )

    select t.id, t.idx, t.trx_date,
        t.descriptions, t.qty, t.unit, t.price,
        t.debt,
        t.cred,
        sum(t.debt - t.cred)
        over (order by t.id, t.idx rows between unbounded preceding and current row) as saldo
    from trx t
    order by t.id, t.idx;

end;

$$;


ALTER FUNCTION public.customer_get_special_transaction(cust_id integer, lunasid integer) OWNER TO postgres;

--
-- Name: customer_get_transaction_detail(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.customer_get_transaction_detail(cust_id integer, lunasid integer) RETURNS TABLE(id integer, idx integer, trx_date timestamp without time zone, descriptions character varying, title character varying, qty numeric, unit character varying, price numeric, debt numeric, cred numeric, saldo numeric)
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

      /*
      select g.id, 4 idx, g.order_date trx_date,
        concat(gp.name, case when g.total_div > 0 then ' *' else '' end) descriptions, concat('Pembelian: #', g.id ) title,
        gd.qty, gd.unit_name unit, gd.price price,
        0::numeric debt,
      --  gd.subtotal::numeric cred
       (gd.subtotal - (gd.subtotal * ( ( (g.total_div+coalesce(c.total,0)) / ( g.total + coalesce(c.total,0) ) ) ) ) )::numeric cred
        from grass_details gd
        inner join products gp on gp.id = gd.product_id
        inner join grass g on g.id = gd.grass_id
        left join (select c.grass_id id, sum(c.subtotal) total from grass_costs c group by c.grass_id) c
        on c.id = g.id
        where g.customer_id = cust_id AND g.lunas_id = lunasid
        */

      select g.id, 4 idx, g.order_date trx_date,
        concat(gp.name, case when g.total_div > 0 then ' *' else '' end) descriptions, concat('Pembelian: #', g.id ) title,
        gd.qty, gd.unit_name unit, gd.price price,
        0::numeric debt,
       (gd.subtotal - (gd.subtotal * ( (g.total_div + g.cost) / ( g.total + g.cost ) ) ) )::numeric cred
        from grass_details gd
        inner join products gp on gp.id = gd.product_id
        inner join grass g on g.id = gd.grass_id
        where g.customer_id = cust_id AND g.lunas_id = lunasid


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


ALTER FUNCTION public.customer_get_transaction_detail(cust_id integer, lunasid integer) OWNER TO postgres;

--
-- Name: get_customer_div(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_customer_div(customer_id integer) RETURNS record
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


ALTER FUNCTION public.get_customer_div(customer_id integer) OWNER TO postgres;

--
-- Name: grass_after_delete_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.grass_after_delete_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    DELETE FROM payments WHERE
        ref_id = OLD.id;

  RETURN OLD;

END; $$;


ALTER FUNCTION public.grass_after_delete_func() OWNER TO postgres;

--
-- Name: grass_after_insert_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.grass_after_insert_func() RETURNS trigger
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
            part_id, concat('Bagi hasil dengan ', cname, ' (', to_char(qty, 'L9G999'), ' kg )'),
            grass_id, pay_date, total_div
        );

    end if;

    RETURN NEW;

END; 
$$;


ALTER FUNCTION public.grass_after_insert_func() OWNER TO postgres;

--
-- Name: grass_after_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.grass_after_update_func() RETURNS trigger
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
            descriptions = concat('Bagi hasil dengan ', cname, ' (', to_char(qty, 'L9G999'), ' kg )'),
            payment_date = pay_date,
            customer_id = part_id
        WHERE ref_id = grass_id;

        IF NOT FOUND THEN
            
            INSERT INTO payments (
                customer_id, descriptions, 
                ref_id, payment_date, total
            ) VALUES (
                part_id, concat('Bagi hasil dengan ', cname, ' (', to_char(qty, 'L9G999'), ' kg )'),
                grass_id, pay_date, total_div
            );

        END IF;

    ELSE

        DELETE FROM payments
            WHERE ref_id = NEW.id;

    END IF;

    RETURN NEW;

END; $$;


ALTER FUNCTION public.grass_after_update_func() OWNER TO postgres;

--
-- Name: grass_cost_after_delete_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.grass_cost_after_delete_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

    update grass set
        total = total + OLD.subtotal,
        cost = cost - OLD.subtotal
        where id = OLD.grass_id;

    RETURN OLD;

end; $$;


ALTER FUNCTION public.grass_cost_after_delete_func() OWNER TO postgres;

--
-- Name: grass_cost_after_insert_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.grass_cost_after_insert_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

    update grass set
        total = total - NEW.subtotal,
        cost = cost  + NEW.subtotal
        where id = NEW.grass_id;

    RETURN NEW;

end; $$;


ALTER FUNCTION public.grass_cost_after_insert_func() OWNER TO postgres;

--
-- Name: grass_cost_after_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.grass_cost_after_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

    update grass set
        total = total - NEW.subtotal + OLD.subtotal,
        cost = cost + NEW.subtotal - OLD.subtotal
        where id = NEW.grass_id;

    RETURN NEW;

end; $$;


ALTER FUNCTION public.grass_cost_after_update_func() OWNER TO postgres;

--
-- Name: grass_cost_before_insert_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.grass_cost_before_insert_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

        NEW.subtotal = NEW.qty * NEW.price;

        RETURN NEW;

end; $$;


ALTER FUNCTION public.grass_cost_before_insert_func() OWNER TO postgres;

--
-- Name: grass_detail_after_delete_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.grass_detail_after_delete_func() RETURNS trigger
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


ALTER FUNCTION public.grass_detail_after_delete_func() OWNER TO postgres;

--
-- Name: grass_detail_after_insert_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.grass_detail_after_insert_func() RETURNS trigger
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


ALTER FUNCTION public.grass_detail_after_insert_func() OWNER TO postgres;

--
-- Name: grass_detail_after_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.grass_detail_after_update_func() RETURNS trigger
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


ALTER FUNCTION public.grass_detail_after_update_func() OWNER TO postgres;

--
-- Name: grass_detail_before_insert_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.grass_detail_before_insert_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    NEW.real_qty = NEW.qty * NEW.content;
    NEW.subtotal = NEW.qty * NEW.price;

    RETURN NEW;

END; $$;


ALTER FUNCTION public.grass_detail_before_insert_update_func() OWNER TO postgres;

--
-- Name: lunas_delete_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.lunas_delete_func() RETURNS trigger
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


ALTER FUNCTION public.lunas_delete_func() OWNER TO postgres;

--
-- Name: lunas_insert_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.lunas_insert_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    update orders set
      lunas_id = NEW.id
      where customer_id = NEW.customer_id
      and lunas_id = 0;

    update special_orders set
      lunas_id = NEW.id
      where customer_id = NEW.customer_id
      and lunas_id = 0;

    update payments set
      lunas_id = NEW.id
      where customer_id = NEW.customer_id
      and lunas_id = 0;

    update special_payments set
      lunas_id = NEW.id
      where customer_id = NEW.customer_id
      and lunas_id = 0;

    update kasbons set
      lunas_id = NEW.id
      where customer_id = NEW.customer_id
      and lunas_id = 0;

    update grass set
      lunas_id = NEW.id
      where customer_id = NEW.customer_id
      and lunas_id = 0;

    if NEW.remain_payment > 0 then
      insert into kasbons (customer_id, descriptions, kasbon_date, jatuh_tempo, total, ref_lunas_id) values (
        NEW.customer_id, concat('Saldo piutang pelunasan ID #'::character varying, NEW.id),
        NEW.created_at, NEW.created_at + INTERVAL '7 days',
        NEW.remain_payment, NEW.id
      );
    end if;

    RETURN NEW;

END; 
$$;


ALTER FUNCTION public.lunas_insert_func() OWNER TO postgres;

--
-- Name: lunas_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.lunas_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    if NEW.remain_payment > 0 then
      update kasbons set 
      total = NEW.remain_payment,
      kasbon_date = NEW.created_at,
      jatuh_tempo = NEW.created_at + INTERVAL '7 days'
      where ref_lunas_id = NEW.id;

      if NOT FOUND then

        if NEW.remain_payment > 0 then
          insert into kasbons (customer_id, descriptions, kasbon_date, jatuh_tempo, total, ref_lunas_id) values (
            NEW.customer_id, concat('Saldo piutang pelunasan ID #'::character varying, NEW.id),
            NEW.created_at, NEW.created_at + INTERVAL '7 days',
            NEW.remain_payment, NEW.id
          );
        end if;

      end if;
    else
      DELETE FROM kasbons
        WHERE ref_lunas_id = NEW.id 
        AND customer_id = NEW.customer_id;
    end if;
    
    RETURN NEW;

END; 
$$;


ALTER FUNCTION public.lunas_update_func() OWNER TO postgres;

--
-- Name: od_before_insert_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.od_before_insert_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

        --raise notice 'value: %', NEW.subtotal;
        NEW.real_qty = NEW.qty * NEW.content;
        NEW.subtotal = NEW.qty * (NEW.price - NEW.discount);

        RETURN NEW;

end; $$;


ALTER FUNCTION public.od_before_insert_func() OWNER TO postgres;

--
-- Name: od_delete_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.od_delete_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

	update products
	set stock = stock + OLD.real_qty
	WHERE id = OLD.product_id;

	update orders set
	total = total - OLD.subtotal
	where id = OLD.order_id;

	RETURN OLD;

end; $$;


ALTER FUNCTION public.od_delete_func() OWNER TO postgres;

--
-- Name: od_insert_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.od_insert_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

	--raise notice 'value: %', NEW.subtotal;

	update products
	set stock = stock - NEW.real_qty
	where id = NEW.product_id;

	update orders set total = total + NEW.subtotal where id = NEW.order_id;

	RETURN NEW;

end; $$;


ALTER FUNCTION public.od_insert_func() OWNER TO postgres;

--
-- Name: od_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.od_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$


begin

	update products
	set stock = stock - NEW.real_qty
	where id = NEW.product_id;

	update products 
	set stock = stock + OLD.real_qty
	where id = OLD.product_id;

	update orders
	set total = total + NEW.subtotal - OLD.subtotal
	where id = NEW.order_id;

	return NEW;

end;

$$;


ALTER FUNCTION public.od_update_func() OWNER TO postgres;

--
-- Name: order_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.order_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

	NEW.remain_payment = NEW.total - NEW.payment;

	--raise notice 'Value: %', NEW.remain_payment;

	RETURN NEW;

end;
$$;


ALTER FUNCTION public.order_update_func() OWNER TO postgres;

--
-- Name: piutang_balance_func(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.piutang_balance_func(cust_id integer, lunasid integer) RETURNS TABLE(id integer, descriptions character varying, debt numeric, cred numeric, saldo numeric)
    LANGUAGE plpgsql
    AS $$

begin

    drop table IF EXISTS temp_table;

    create temporary table temp_table(
        id integer,
        descriptions varchar(128),
        cred decimal(12,2),
        debt decimal(12,2)
    );

     insert into temp_table (id, descriptions, debt, cred)
     select 1, 'Piutang Barang', coalesce(sum(c.total),0), coalesce(sum(c.payment),0)
     from orders c
     where c.customer_id = cust_id and c.lunas_id = lunasid;

     insert into temp_table (id, descriptions, debt, cred)
     select 2, 'Kasbon', coalesce(sum(c.total),0), 0
     from kasbons c
     where c.customer_id = cust_id and c.lunas_id = lunasid;

     insert into temp_table (id, descriptions, debt, cred)
     select 3, 'Pembelian', 0, coalesce(sum(c.total - c.total_div),0)
     from grass c
     where c.customer_id = cust_id and c.lunas_id = lunasid;

     insert into temp_table (id, descriptions, debt, cred)
     select 4, 'Cicilan', 0, coalesce(sum(c.total),0)
     from payments c
     where c.customer_id = cust_id and c.lunas_id = lunasid;

     return query select
         c.id, c.descriptions, c.debt, c.cred, sum(c.debt - c.cred)
         over (order by c.id
         rows between unbounded preceding and current row) as saldo
         from temp_table as c
    where c.debt > 0 or c.cred > 0;


 end;

 $$;


ALTER FUNCTION public.piutang_balance_func(cust_id integer, lunasid integer) OWNER TO postgres;

--
-- Name: product_get_transaction_detail(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.product_get_transaction_detail(prod_id integer) RETURNS TABLE(id integer, trx_date character varying, faktur character varying, name character varying, real_qty numeric, unit_name character varying, debt numeric, cred numeric, saldo numeric)
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


ALTER FUNCTION public.product_get_transaction_detail(prod_id integer) OWNER TO postgres;

--
-- Name: product_stock_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.product_stock_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

  --  raise notice 'test %', NEW.first_stock;
    NEW.stock = NEW.stock + NEW.first_stock - OLD.first_stock;

    RETURN NEW;

end; $$;


ALTER FUNCTION public.product_stock_update_func() OWNER TO postgres;

--
-- Name: product_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.product_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

declare buyPrice decimal(12,2);
begin

    buyPrice := NEW.price;

    update units set
	buy_price = buyPrice * content,
	price = (buyPrice * content) + ((buyPrice * content) * margin)
	where product_id = NEW.id;

    RETURN NEW;

end; $$;


ALTER FUNCTION public.product_update_func() OWNER TO postgres;

--
-- Name: sd_before_insert_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sd_before_insert_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

        --raise notice 'value: %', NEW.subtotal;
        NEW.real_qty = NEW.qty * NEW.content;
        NEW.subtotal = NEW.qty * (NEW.price - NEW.discount);

        RETURN NEW;

end; $$;


ALTER FUNCTION public.sd_before_insert_func() OWNER TO postgres;

--
-- Name: sd_delete_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sd_delete_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

	update products
	set stock = stock - OLD.real_qty
	WHERE id = OLD.product_id;

	update stocks set
	total = total - OLD.subtotal
	where id = OLD.stock_id;

	RETURN OLD;

end; $$;


ALTER FUNCTION public.sd_delete_func() OWNER TO postgres;

--
-- Name: sd_insert_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sd_insert_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

	--raise notice 'value: %', NEW.subtotal;

	update products
	set stock = stock + NEW.real_qty
	where id = NEW.product_id;

	update stocks set total = total + NEW.subtotal where id = NEW.stock_id;

	RETURN NEW;

end; $$;


ALTER FUNCTION public.sd_insert_func() OWNER TO postgres;

--
-- Name: sd_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sd_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$


begin

	update products
	set stock = stock + NEW.real_qty
	where id = NEW.product_id;

	update products 
	set stock = stock - OLD.real_qty
	where id = OLD.product_id;

	update stocks
	set total = total + NEW.subtotal - OLD.subtotal
	-- remain_payment = remain_payment + NEW.subtotal - OLD.subtotal
	where id = NEW.stock_id;

	return NEW;

end;

$$;


ALTER FUNCTION public.sd_update_func() OWNER TO postgres;

--
-- Name: set_default_unit(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_default_unit(prod_id integer, unit_id integer) RETURNS boolean
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


ALTER FUNCTION public.set_default_unit(prod_id integer, unit_id integer) OWNER TO postgres;

--
-- Name: sip_cust_balance_detail(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sip_cust_balance_detail(cust_id integer, lunasid integer) RETURNS TABLE(id integer, customer_id integer, descriptions character varying, trx_date timestamp without time zone, debt numeric, cred numeric, saldo numeric)
    LANGUAGE plpgsql
    AS $$

begin

    return query with recursive trx as (

        select o.id, o.customer_id, o.descriptions, o.order_date trx_date,
        o.total debt,
        o.payment cred
        from orders o
        where o.customer_id = cust_id
        and o.lunas_id = lunasid

        union all

        select k.id, k.customer_id, k.descriptions, k.kasbon_date trx_date,
        k.total debt,
        0::numeric cred
        from kasbons k
        where k.customer_id = cust_id
        and k.lunas_id = lunasid

        union all

        select g.id, g.customer_id, g.descriptions, g.order_date trx_date,
        0::numeric debt,
        g.total - g.total_div cred
        from grass g
        where g.customer_id = cust_id
        and g.lunas_id = lunasid

        union all

        select p.id, p.customer_id, p.descriptions, p.payment_date trx_date,
        0::numeric debt,
        p.total cred
        from payments p
        where p.customer_id = cust_id
        and p.lunas_id = lunasid
    )

    select t.id, t.customer_id, t.descriptions, t.trx_date,
        t.debt,
        t.cred,
        sum(t.debt - t.cred)
        over (order by t.id rows between unbounded preceding and current row) as saldo
    from trx t
    order by t.id;

end;

$$;


ALTER FUNCTION public.sip_cust_balance_detail(cust_id integer, lunasid integer) OWNER TO postgres;

--
-- Name: sip_sup_balance_detail(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sip_sup_balance_detail(sup_id integer) RETURNS TABLE(id integer, supplier_id integer, trx_ref character varying, descriptions character varying, trx_date timestamp without time zone, debt numeric, cred numeric, saldo numeric)
    LANGUAGE plpgsql
    AS $$

begin

    return query with recursive trx as (

	select s.id, s.supplier_id, s.stock_num trx_ref, s.descriptions,
	s.stock_date trx_date, s.total debt, s.cash cred
	from stocks s
	where s.supplier_id = sup_id

	union all

	select p.id, c.supplier_id, p.pay_num trx_ref, p.descriptions,
	p.pay_date trx_date, 0::numeric, p.nominal cred
	from stock_payments p
	inner join stocks c on c.id = p.stock_id
	where c.supplier_id = sup_id

    )

    select t.id, t.supplier_id, t.trx_ref, t.descriptions, t.trx_date,
        t.debt,
        t.cred,
        sum(t.debt - t.cred)
        over (order by t.id rows between unbounded preceding and current row) as saldo
    from trx t
    order by t.id;	

end;

$$;


ALTER FUNCTION public.sip_sup_balance_detail(sup_id integer) OWNER TO postgres;

--
-- Name: spd_aft_delete_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.spd_aft_delete_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

  update products set
  stock = stock + OLD.real_qty
  WHERE id = OLD.product_id;

  update special_orders set
  total = total - OLD.subtotal
  where id = OLD.order_id;

  RETURN OLD;

end; $$;


ALTER FUNCTION public.spd_aft_delete_func() OWNER TO postgres;

--
-- Name: spd_aft_insert_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.spd_aft_insert_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

  --raise notice 'value: %', NEW.subtotal;

    update products set
    stock = stock - NEW.real_qty
    where id = NEW.product_id;

    update special_orders set
    total = total + NEW.subtotal
    where id = NEW.order_id;

    RETURN NEW;

end; $$;


ALTER FUNCTION public.spd_aft_insert_func() OWNER TO postgres;

--
-- Name: spd_aft_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.spd_aft_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

    update special_orders set
    total = total + NEW.subtotal - OLD.subtotal
    where id = NEW.order_id;

    if OLD.product_id = NEW.product_id then

      update products set
      stock = stock - OLD.real_qty + NEW.real_qty
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


ALTER FUNCTION public.spd_aft_update_func() OWNER TO postgres;

--
-- Name: spd_bef_insert_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.spd_bef_insert_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

  --raise notice 'value: %', NEW.subtotal;
  NEW.real_qty = NEW.qty * NEW.content;
  NEW.subtotal = NEW.qty * NEW.price;

  RETURN NEW;

end; $$;


ALTER FUNCTION public.spd_bef_insert_func() OWNER TO postgres;

--
-- Name: special_customer_get_balance(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.special_customer_get_balance(cust_id integer, lunasid integer) RETURNS TABLE(id integer, customer_id integer, descriptions character varying, trx_date timestamp without time zone, debt numeric, cred numeric, saldo numeric)
    LANGUAGE plpgsql
    AS $$

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

$$;


ALTER FUNCTION public.special_customer_get_balance(cust_id integer, lunasid integer) OWNER TO postgres;

--
-- Name: special_piutang_balance_func(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.special_piutang_balance_func(cust_id integer, lunasid integer) RETURNS TABLE(id smallint, descriptions character varying, debt numeric, cred numeric, saldo numeric)
    LANGUAGE plpgsql
    AS $$

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

$$;


ALTER FUNCTION public.special_piutang_balance_func(cust_id integer, lunasid integer) OWNER TO postgres;

--
-- Name: spo_bef_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.spo_bef_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

  NEW.remain_payment = NEW.total - NEW.cash - NEW.payments;
  NEW.updated_at = now();
  
  RETURN NEW;

end;
$$;


ALTER FUNCTION public.spo_bef_update_func() OWNER TO postgres;

--
-- Name: spo_payment_aft_insert_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.spo_payment_aft_insert_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

    UPDATE special_orders SET
      payments = payments + NEW.nominal
      WHERE id = NEW.order_id;

    RETURN NEW;

end;
$$;


ALTER FUNCTION public.spo_payment_aft_insert_func() OWNER TO postgres;

--
-- Name: spo_payment_aft_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.spo_payment_aft_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

    UPDATE special_orders SET
      payments = payments + NEW.nominal - OLD.nominal
      WHERE id = NEW.order_id;

    RETURN NEW;

end;
$$;


ALTER FUNCTION public.spo_payment_aft_update_func() OWNER TO postgres;

--
-- Name: spo_payment_delete_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.spo_payment_delete_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

    UPDATE special_orders SET
    payments = payments - OLD.nominal
    where id = OLD.order_id;

    RETURN OLD;

end;
$$;


ALTER FUNCTION public.spo_payment_delete_func() OWNER TO postgres;

--
-- Name: stc_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.stc_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

NEW.remain_payment = NEW.total - (NEW.cash + NEW.payments);

--raise notice 'Value: %', NEW.remain_payment;

RETURN NEW;

end;
$$;


ALTER FUNCTION public.stc_update_func() OWNER TO postgres;

--
-- Name: sup_payment_delete_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sup_payment_delete_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

    update stocks set
    payments = payments - OLD.nominal
    where id = OLD.stock_id;

    RETURN OLD;

end;
$$;


ALTER FUNCTION public.sup_payment_delete_func() OWNER TO postgres;

--
-- Name: sup_payment_insert_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sup_payment_insert_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

    update stocks set
    payments = payments + NEW.nominal
    where id = NEW.stock_id;

    RETURN NEW;

end;
$$;


ALTER FUNCTION public.sup_payment_insert_func() OWNER TO postgres;

--
-- Name: sup_payment_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sup_payment_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

    update stocks set
    payments = payments + NEW.nominal - OLD.nominal
    where id = NEW.stock_id;

    RETURN NEW;

end;
$$;


ALTER FUNCTION public.sup_payment_update_func() OWNER TO postgres;

--
-- Name: supplier_balance_func(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.supplier_balance_func(sup_id integer) RETURNS TABLE(id integer, descriptions character varying, cred numeric, debt numeric, saldo numeric)
    LANGUAGE plpgsql
    AS $$

begin

     drop table IF EXISTS temp_table;

     create temporary table temp_table(
         id integer,
         descriptions varchar(128),
         cred decimal(12,2),
         debt decimal(12,2)
     );

     insert into temp_table (id, descriptions, debt, cred)
     select 1, 'Piutang Barang', coalesce(sum(c.total),0), coalesce(sum(c.cash),0)
     from stocks c
     where c.supplier_id = sup_id;

     insert into temp_table (id, descriptions, debt, cred)
     select 2, 'Angsuran', 0, coalesce(sum(c.nominal),0)
     from stock_payments c
     inner join stocks s on s.id = c.stock_id
     where s.supplier_id = sup_id;

--    insert into temp_table (id, descriptions, cred, debt)
--     select 3, 'Pembelian', 0, coalesce(sum(c.total),0)
--    from grass c
--     where c.customer_id = cust_id;

--     insert into temp_table (id, descriptions, cred, debt)
--     select 4, 'Cicilan', 0, coalesce(sum(c.total),0)
--     from payments c
--     where c.customer_id = cust_id;

     return query select
         c.id, c.descriptions, c.cred, c.debt, sum(c.debt - c.cred)
         over (order by c.id
         rows between unbounded preceding and current row) as saldo
         from temp_table as c
	where c.cred > 0 or c.debt > 0;

 end;

 $$;


ALTER FUNCTION public.supplier_balance_func(sup_id integer) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id smallint NOT NULL,
    name character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: customer_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customer_seq OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer DEFAULT nextval('public.customer_seq'::regclass) NOT NULL,
    name character varying(50) NOT NULL,
    street character varying(128),
    city character varying(50),
    phone character varying(25),
    customer_type public.cust_type DEFAULT 'Bandeng'::public.cust_type NOT NULL
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: order_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_seq OWNER TO postgres;

--
-- Name: grass; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grass (
    customer_id integer NOT NULL,
    id integer DEFAULT nextval('public.order_seq'::regclass) NOT NULL,
    descriptions character varying(128) NOT NULL,
    order_date timestamp without time zone NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    qty numeric(10,2) DEFAULT 0 NOT NULL,
    total_div numeric(12,2) DEFAULT 0 NOT NULL,
    lunas_id integer DEFAULT 0 NOT NULL,
    partner_id integer DEFAULT 0 NOT NULL,
    cost numeric(12,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.grass OWNER TO postgres;

--
-- Name: grass_costs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grass_costs (
    grass_id integer NOT NULL,
    id integer NOT NULL,
    memo character varying(128) NOT NULL,
    qty numeric(12,2) DEFAULT 0 NOT NULL,
    price numeric(12,2) DEFAULT 0 NOT NULL,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    unit character varying(6) NOT NULL
);


ALTER TABLE public.grass_costs OWNER TO postgres;

--
-- Name: grass_costs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.grass_costs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.grass_costs_id_seq OWNER TO postgres;

--
-- Name: grass_costs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.grass_costs_id_seq OWNED BY public.grass_costs.id;


--
-- Name: grass_detail_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.grass_detail_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.grass_detail_seq OWNER TO postgres;

--
-- Name: order_detail_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_detail_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_detail_seq OWNER TO postgres;

--
-- Name: grass_details; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.grass_details OWNER TO postgres;

--
-- Name: kasbons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kasbons (
    id integer DEFAULT nextval('public.order_seq'::regclass) NOT NULL,
    customer_id integer NOT NULL,
    descriptions character varying(128) NOT NULL,
    kasbon_date timestamp without time zone NOT NULL,
    jatuh_tempo timestamp without time zone NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    lunas_id integer DEFAULT 0 NOT NULL,
    ref_lunas_id integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.kasbons OWNER TO postgres;

--
-- Name: lunas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lunas (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    remain_payment numeric(12,2) DEFAULT 0 NOT NULL,
    descriptions character varying(128),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lunas OWNER TO postgres;

--
-- Name: lunas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lunas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lunas_id_seq OWNER TO postgres;

--
-- Name: lunas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lunas_id_seq OWNED BY public.lunas.id;


--
-- Name: order_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_details (
    order_id integer NOT NULL,
    id integer DEFAULT nextval('public.order_detail_seq'::regclass) NOT NULL,
    unit_id integer NOT NULL,
    qty numeric(10,2) DEFAULT 0 NOT NULL,
    content numeric(8,2) DEFAULT 0 NOT NULL,
    unit_name character varying(6) NOT NULL,
    real_qty numeric(10,2) DEFAULT 0 NOT NULL,
    price numeric(12,2) DEFAULT 0 NOT NULL,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    buy_price numeric(12,2) DEFAULT 0 NOT NULL,
    product_id integer NOT NULL,
    discount numeric(12,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.order_details OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer DEFAULT nextval('public.order_seq'::regclass) NOT NULL,
    customer_id integer NOT NULL,
    order_date timestamp without time zone NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    payment numeric(12,2) DEFAULT 0 NOT NULL,
    remain_payment numeric(12,2) DEFAULT 0 NOT NULL,
    descriptions character varying(128) NOT NULL,
    lunas_id integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer DEFAULT nextval('public.order_seq'::regclass) NOT NULL,
    customer_id integer NOT NULL,
    descriptions character varying(50) NOT NULL,
    ref_id integer DEFAULT 0 NOT NULL,
    payment_date timestamp without time zone NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    lunas_id integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: product_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_seq OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer DEFAULT nextval('public.product_seq'::regclass) NOT NULL,
    name character varying(50) NOT NULL,
    spec character varying(50),
    price numeric(12,2) DEFAULT 0 NOT NULL,
    stock numeric(12,2) DEFAULT 0 NOT NULL,
    first_stock numeric(12,2) DEFAULT 0 NOT NULL,
    unit character varying(6) NOT NULL,
    update_notif boolean DEFAULT false NOT NULL,
    category_id smallint DEFAULT 0 NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: seq_stock; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seq_stock
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.seq_stock OWNER TO postgres;

--
-- Name: seq_supplier; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seq_supplier
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.seq_supplier OWNER TO postgres;

--
-- Name: special_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.special_details (
    order_id integer NOT NULL,
    id integer DEFAULT nextval('public.order_detail_seq'::regclass) NOT NULL,
    product_id integer NOT NULL,
    unit_id integer NOT NULL,
    qty numeric(10,2) NOT NULL,
    unit_name character varying(6) NOT NULL,
    price numeric(12,2) DEFAULT 0 NOT NULL,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    content numeric(8,2) DEFAULT 0 NOT NULL,
    real_qty numeric(10,2) DEFAULT 0 NOT NULL,
    buy_price numeric(12,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.special_details OWNER TO postgres;

--
-- Name: special_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.special_orders (
    id integer DEFAULT nextval('public.order_seq'::regclass) NOT NULL,
    customer_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    packaged_at timestamp without time zone DEFAULT now() NOT NULL,
    shipped_at timestamp without time zone DEFAULT now() NOT NULL,
    driver_name character varying(50) NOT NULL,
    police_number character varying(15) NOT NULL,
    street character varying(128) NOT NULL,
    city character varying(50) NOT NULL,
    phone character varying(25) NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    cash numeric(12,2) DEFAULT 0 NOT NULL,
    payments numeric(12,2) DEFAULT 0 NOT NULL,
    remain_payment numeric(12,2) DEFAULT 0 NOT NULL,
    descriptions character varying(128),
    lunas_id integer DEFAULT 0 NOT NULL,
    surat_jalan character varying(50) DEFAULT '-'::character varying NOT NULL
);


ALTER TABLE public.special_orders OWNER TO postgres;

--
-- Name: special_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.special_payments (
    customer_id integer NOT NULL,
    order_id integer DEFAULT 0 NOT NULL,
    id integer DEFAULT nextval('public.order_seq'::regclass) NOT NULL,
    descriptions character varying(128),
    payment_at timestamp without time zone NOT NULL,
    nominal numeric(12,2) DEFAULT 0 NOT NULL,
    pay_num character varying(50) NOT NULL,
    lunas_id integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.special_payments OWNER TO postgres;

--
-- Name: stock_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_details (
    stock_id integer NOT NULL,
    id integer DEFAULT nextval('public.order_detail_seq'::regclass) NOT NULL,
    product_id integer NOT NULL,
    unit_id integer NOT NULL,
    qty numeric(10,2) DEFAULT 0 NOT NULL,
    content numeric(8,2) DEFAULT 0 NOT NULL,
    unit_name character varying(6) NOT NULL,
    real_qty numeric(10,2) DEFAULT 0 NOT NULL,
    price numeric(12,2) DEFAULT 0 NOT NULL,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    discount numeric(12,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.stock_details OWNER TO postgres;

--
-- Name: stock_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_payments (
    id integer DEFAULT nextval('public.seq_stock'::regclass) NOT NULL,
    stock_id integer NOT NULL,
    pay_num character varying(50) NOT NULL,
    pay_date timestamp without time zone NOT NULL,
    nominal numeric(12,2) DEFAULT 0 NOT NULL,
    descriptions character varying(128)
);


ALTER TABLE public.stock_payments OWNER TO postgres;

--
-- Name: stocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stocks (
    id integer DEFAULT nextval('public.seq_stock'::regclass) NOT NULL,
    supplier_id integer NOT NULL,
    stock_num character varying(50) NOT NULL,
    stock_date timestamp without time zone NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    cash numeric(12,2) DEFAULT 0 NOT NULL,
    payments numeric(12,2) DEFAULT 0 NOT NULL,
    remain_payment numeric(12,2) DEFAULT 0 NOT NULL,
    descriptions character varying(128)
);


ALTER TABLE public.stocks OWNER TO postgres;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id integer DEFAULT nextval('public.seq_supplier'::regclass) NOT NULL,
    name character varying(50) NOT NULL,
    sales_name character varying(50),
    street character varying(128),
    city character varying(50),
    phone character varying(25),
    cell character varying(25),
    email character varying(50)
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: unit_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.unit_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.unit_seq OWNER TO postgres;

--
-- Name: units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.units (
    product_id integer DEFAULT 0 NOT NULL,
    id integer DEFAULT nextval('public.unit_seq'::regclass) NOT NULL,
    name character varying(50) NOT NULL,
    content numeric(8,2) DEFAULT 0 NOT NULL,
    price numeric(12,2) DEFAULT 0 NOT NULL,
    buy_price numeric(12,2) DEFAULT 0 NOT NULL,
    margin numeric(5,4) DEFAULT 0 NOT NULL,
    is_default boolean DEFAULT false
);


ALTER TABLE public.units OWNER TO postgres;

--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: grass_costs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grass_costs ALTER COLUMN id SET DEFAULT nextval('public.grass_costs_id_seq'::regclass);


--
-- Name: lunas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lunas ALTER COLUMN id SET DEFAULT nextval('public.lunas_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, created_at, updated_at) FROM stdin;
2	Pertanian	2021-12-01 19:05:47.43805+07	2021-12-02 00:20:00+07
1	Produk Toko	2021-12-01 19:05:47.43805+07	2021-12-02 01:11:00+07
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, name, street, city, phone, customer_type) FROM stdin;
1	Dhoni Armadi	Ds. Telukagung	Indramayu	085-5556-65656	Rumput Laut
3	CV. PURNAMA SEJAHTERA	Jl. Jend. Sudirman No. 155	Indramayu	08532654125	Pabrik
4	Joni Armadi	Ds. Telukagung	Indramayu	085-5556-65656	Rumput Laut
2	Agung Priatna	RT. 14 / 06 Bloak Sindu Praja	Ds. Plumbon	085-5556-65656	Bandeng
\.


--
-- Data for Name: grass; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grass (customer_id, id, descriptions, order_date, total, qty, total_div, lunas_id, partner_id, cost) FROM stdin;
2	56	Rumput Laut	2021-12-02 22:22:00	550000.00	200.00	250000.00	0	1	0.00
4	196	Pembelian Rumput Laut	2021-12-11 16:24:00	4445000.00	1500.00	2220000.00	0	2	77500.00
1	173	Pembelian Rumput Laut	2021-12-10 13:56:00	117000.00	60.00	58500.00	0	2	0.00
2	174	Pembelian Rumput Laut	2021-12-10 13:56:00	195000.00	100.00	0.00	0	0	0.00
2	164	Rumput Laut	2021-12-06 10:55:00	375000.00	250.00	0.00	0	0	0.00
2	175	Pembelian Rumput Laut	2021-12-10 13:56:00	1160900.00	602.00	1950.00	0	1	0.00
2	50	Pembelian Rumput Laut	2021-11-28 08:16:00	77500.00	25.00	0.00	0	1	0.00
\.


--
-- Data for Name: grass_costs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grass_costs (grass_id, id, memo, qty, price, subtotal, created_at, updated_at, unit) FROM stdin;
175	1	Kapal api	7.00	1500.00	10500.00	2021-12-11 11:41:00+07	2021-12-11 04:43:00+07	pcs
175	3	Sega goreng	1.00	2500.00	2500.00	2021-12-11 11:53:00+07	2021-12-10 07:53:00+07	bks
50	5	Sega goreng	5.00	12000.00	60000.00	2021-12-11 12:56:00+07	2021-12-11 12:57:45.048341+07	bks
56	7		0.00	0.00	0.00	2021-12-11 13:16:00+07	2021-12-11 13:18:17.840331+07	
196	37	kopi	1.00	15000.00	15000.00	2021-12-11 16:35:00+07	2021-12-11 16:41:45.431258+07	ls
196	38	sega goreng	5.00	12500.00	62500.00	2021-12-11 16:35:00+07	2021-12-11 16:42:13.746842+07	bks
\.


--
-- Data for Name: grass_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grass_details (grass_id, id, unit_id, qty, content, unit_name, real_qty, price, subtotal, buy_price, product_id) FROM stdin;
174	163	23	100.00	1.00	pcs	100.00	1950.00	195000.00	1500.00	16
175	164	23	2.00	1.00	pcs	2.00	1950.00	3900.00	1500.00	16
175	165	24	200.00	3.00	kg	600.00	5850.00	1170000.00	4500.00	16
173	168	24	20.00	3.00	kg	60.00	5850.00	117000.00	4500.00	16
196	178	24	350.00	3.00	kg	1050.00	5850.00	2047500.00	4500.00	16
196	179	27	450.00	1.00	kg	450.00	5500.00	2475000.00	0.00	23
\.


--
-- Data for Name: kasbons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kasbons (id, customer_id, descriptions, kasbon_date, jatuh_tempo, total, lunas_id, ref_lunas_id) FROM stdin;
163	2	Kasbon	2021-12-06 10:54:00	2021-12-13 10:54:00	100000.00	0	0
31	2	Kasbon Beli Terpal	2021-12-17 00:00:00	2021-12-24 00:00:00	1500000.00	0	0
37	2	Kasbon ewe	2021-11-25 13:01:00	2021-12-02 13:01:00	25000.00	0	0
195	4	Kasbon	2021-12-11 16:39:00	2021-12-18 16:39:00	5000000.00	0	0
\.


--
-- Data for Name: lunas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lunas (id, customer_id, remain_payment, descriptions, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: order_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_details (order_id, id, unit_id, qty, content, unit_name, real_qty, price, subtotal, buy_price, product_id, discount) FROM stdin;
46	111	21	1.00	1.00	zak	1.00	325000.00	325000.00	250000.00	15	0.00
46	114	17	1.00	1.00	pcs	1.00	39000.00	39000.00	30000.00	1	0.00
49	115	17	1.00	1.00	pcs	1.00	39000.00	39000.00	30000.00	1	0.00
49	157	1	1.00	1.00	btl	1.00	15000.00	15000.00	10000.00	7	0.00
162	160	1	2.00	1.00	btl	2.00	15000.00	30000.00	10000.00	7	0.00
36	167	2	1.00	10.00	pak	10.00	130000.00	100000.00	100000.00	7	30000.00
46	112	1	1.00	1.00	btl	1.00	15000.00	15000.00	10000.00	7	0.00
32	87	21	1.00	1.00	zak	1.00	325000.00	300000.00	250000.00	15	25000.00
162	169	25	1.00	12.00	ls	12.00	150000.00	150000.00	120000.00	7	0.00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, customer_id, order_date, total, payment, remain_payment, descriptions, lunas_id) FROM stdin;
36	1	2021-11-25 12:15:00	100000.00	50000.00	50000.00	Utang Pupuk dan Obat	0
46	1	2021-11-28 02:56:00	379000.00	0.00	379000.00	Penjualan Umum	0
49	2	2021-11-28 08:04:00	54000.00	0.00	54000.00	Pembelian Barang	0
32	2	2021-11-17 15:38:00	300000.00	30000.00	270000.00	Utang Obat	0
162	2	2021-12-06 10:55:00	180000.00	55000.00	125000.00	Pembelian Barang	0
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, customer_id, descriptions, ref_id, payment_date, total, lunas_id) FROM stdin;
176	1	Bagi hasil dengan Agung Priatna(    602 kg)	175	2021-12-10 13:56:00	1950.00	0
57	1	Bagi hasil dengan Agung Priatna(    200 kg)	56	2021-12-02 22:22:00	250000.00	0
197	2	Bagi hasil dengan Joni Armadi (  1,500 kg )	196	2021-12-11 16:24:00	2220000.00	0
177	2	Bagi hasil dengan Dhoni Armadi (     60 kg)	173	2021-12-10 13:56:00	58500.00	0
165	2	Cicilan	0	2021-12-06 10:55:00	700000.00	0
33	2	Cicilan Bayar Obat	0	2021-11-18 11:55:00	25000.00	0
125	2	Cicilan	0	2021-12-06 01:13:00	500000.00	0
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, spec, price, stock, first_stock, unit, update_notif, category_id) FROM stdin;
1	EM 4 Perikanan	1 ltr	30000.00	143.00	100.00	pcs	t	1
7	Abachel	250cc	10000.00	79.00	90.00	btl	t	1
15	Pakan Bandeng	Pelet KW1	250000.00	111.00	110.00	zak	t	1
16	Rumput Laut	KW-1	1500.00	172.00	20.00	kg	t	2
23	Rumput Laut KW-2	\N	3500.00	450.00	0.00	kg	t	2
\.


--
-- Data for Name: special_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.special_details (order_id, id, product_id, unit_id, qty, unit_name, price, subtotal, content, real_qty, buy_price) FROM stdin;
104	153	16	23	25.00	pcs	1950.00	48750.00	1.00	25.00	1500.00
104	154	16	23	100.00	pcs	1950.00	195000.00	1.00	100.00	1500.00
106	155	16	23	10.00	pcs	1950.00	19500.00	1.00	10.00	1500.00
109	156	16	24	100.00	kg	5850.00	585000.00	3.00	300.00	4500.00
\.


--
-- Data for Name: special_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.special_orders (id, customer_id, created_at, updated_at, packaged_at, shipped_at, driver_name, police_number, street, city, phone, total, cash, payments, remain_payment, descriptions, lunas_id, surat_jalan) FROM stdin;
104	3	2021-12-04 01:29:00	2021-12-04 23:12:28.012161	2021-12-04 01:29:00	2021-12-04 01:29:00	Udin	-5665656	Jl. Jend. Sudirman No. 155	Indramayu	08532654125	243750.00	43750.00	200000.00	0.00	\N	0	-
106	3	2021-12-06 00:00:00	2021-12-04 23:13:35.145055	2021-12-04 01:29:00	2021-12-04 01:29:00	tttt	werwerwer	Jl. Jend. Sudirman No. 155	Indramayu	08532654125	19500.00	0.00	19500.00	0.00	\N	0	-
109	3	2021-12-07 00:00:00	2021-12-09 12:09:04.354374	2021-12-07 00:00:00	2021-12-07 00:00:00	Warim	E-1025-GH	Jl. Jend. Sudirman No. 155	Indramayu	08532654125	585000.00	0.00	0.00	585000.00	\N	0	-ss
\.


--
-- Data for Name: special_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.special_payments (customer_id, order_id, id, descriptions, payment_at, nominal, pay_num, lunas_id) FROM stdin;
3	106	107	Angsuran piutang dagang #106	2021-12-06 00:00:00	19500.00	xc/2656/155464	0
3	104	105	Angsuran piutang dagang #104	2021-12-05 00:00:00	200000.00	qweqwewqe qweqwe	0
\.


--
-- Data for Name: stock_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_details (stock_id, id, product_id, unit_id, qty, content, unit_name, real_qty, price, subtotal, discount) FROM stdin;
4	94	15	21	3.00	1.00	zak	3.00	250000.00	750000.00	0.00
11	92	7	1	4.00	1.00	btl	4.00	10000.00	40000.00	0.00
11	95	1	17	2.00	1.00	pcs	2.00	30000.00	60000.00	0.00
29	96	7	1	3.00	1.00	btl	3.00	10000.00	30000.00	0.00
4	97	1	17	50.00	1.00	pcs	50.00	30000.00	1500000.00	0.00
12	91	7	2	1.00	10.00	pak	10.00	100000.00	100000.00	0.00
12	90	15	21	10.00	1.00	zak	10.00	250000.00	2500000.00	0.00
33	98	1	17	3.00	1.00	pcs	3.00	30000.00	90000.00	0.00
\.


--
-- Data for Name: stock_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_payments (id, stock_id, pay_num, pay_date, nominal, descriptions) FROM stdin;
24	11	x-0001	2021-11-23 03:16:00	35000.00	Bayar Stock Pembelian #BG-562987
23	11	x-0001	2021-11-23 03:08:00	50000.00	Bayar Stock Pembelian #BG-562987
25	12	x-65000	2021-11-23 03:25:00	510000.00	Bayar Stock Pembelian #CV/3-985441
26	4	cp-004	2021-11-23 03:27:00	50000.00	Bayar Stock Pembelian #x-10256559
27	11	x63332	2021-11-23 03:32:00	10000.00	Bayar Stock Pembelian #BG-562987
30	29	x9898	2021-11-23 03:39:00	10000.00	Bayar Stock Pembelian #ssssss
31	29	x-695554	2021-11-23 13:40:00	15000.00	Bayar Stock Pembelian #ssssss
32	4	c-6522	2021-11-23 14:38:00	1250000.00	Bayar Stock Pembelian #x-10256559
46	33	ww	2021-11-25 11:54:00	25000.00	Bayar Stock Pembelian #dddd
47	33	ewqewe	2021-11-25 11:56:00	5000.00	Bayar Stock Pembelian #dddd
\.


--
-- Data for Name: stocks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stocks (id, supplier_id, stock_num, stock_date, total, cash, payments, remain_payment, descriptions) FROM stdin;
29	6	ssssss	2021-11-23 03:38:00	30000.00	5000.00	25000.00	0.00	\N
4	2	x-10256559	2021-11-22 20:49:00	2250000.00	700000.00	1300000.00	250000.00	test
12	5	CV/3-985441	2021-11-22 21:14:00	2600000.00	300000.00	510000.00	1790000.00	\N
11	4	BG-562987	2021-11-22 21:04:00	100000.00	5000.00	95000.00	0.00	Jatuh tempo tanggal 8-10-2021
33	1	dddd	2021-11-23 14:41:00	90000.00	50000.00	30000.00	10000.00	\N
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, name, sales_name, street, city, phone, cell, email) FROM stdin;
1	CV. Karya Baru	Mu'in	\N	Indramayu	qweqweqwe	\N	\N
2	CV. Marga Mekar	Mastur	Jl. Jend. Sudirman No. 155	Indramayu qwewqe	0856232154	5646565	mastur.st12@gmail.com
5	CV. Sejahtera	Sumarno, Sp.d	\N	qweqwe	\N	\N	\N
4	Gudang Garam, PT	Dhoni	qweqwewe	Jakartra	\N	\N	\N
6	Inti Persada, PT	qweqwe	eqweeeee	Indramayu	\N	\N	\N
\.


--
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.units (product_id, id, name, content, price, buy_price, margin, is_default) FROM stdin;
23	27	kg	1.00	5500.00	0.00	0.5714	f
15	22	pak	3.00	950025.00	750000.00	0.2667	f
15	21	zak	1.00	325000.00	250000.00	0.3000	t
16	23	pcs	1.00	1950.00	1500.00	0.3000	f
16	24	kg	3.00	5850.00	4500.00	0.3000	t
7	1	btl	1.00	15000.00	10000.00	0.5000	f
7	2	pak	10.00	130000.00	100000.00	0.3000	f
7	25	ls	12.00	150000.00	120000.00	0.2500	t
1	19	ls	12.00	468000.00	360000.00	0.3000	f
1	17	pcs	1.00	39000.00	30000.00	0.3000	f
1	20	pak	3.00	99999.00	90000.00	0.1111	t
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 6, true);


--
-- Name: customer_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customer_seq', 4, true);


--
-- Name: grass_costs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grass_costs_id_seq', 38, true);


--
-- Name: grass_detail_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grass_detail_seq', 9, true);


--
-- Name: lunas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lunas_id_seq', 104, true);


--
-- Name: order_detail_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_detail_seq', 179, true);


--
-- Name: order_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_seq', 197, true);


--
-- Name: product_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_seq', 26, true);


--
-- Name: seq_stock; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seq_stock', 47, true);


--
-- Name: seq_supplier; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seq_supplier', 40, true);


--
-- Name: unit_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.unit_seq', 27, true);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: grass_costs grass_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grass_costs
    ADD CONSTRAINT grass_costs_pkey PRIMARY KEY (id);


--
-- Name: grass_details grass_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grass_details
    ADD CONSTRAINT grass_details_pkey PRIMARY KEY (id);


--
-- Name: grass grass_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grass
    ADD CONSTRAINT grass_pkey PRIMARY KEY (id);


--
-- Name: kasbons kasbon_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kasbons
    ADD CONSTRAINT kasbon_pkey PRIMARY KEY (id);


--
-- Name: lunas lunas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lunas
    ADD CONSTRAINT lunas_pkey PRIMARY KEY (id);


--
-- Name: order_details order_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT order_details_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payment_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: special_details special_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_details
    ADD CONSTRAINT special_details_pkey PRIMARY KEY (id);


--
-- Name: special_orders special_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_orders
    ADD CONSTRAINT special_orders_pkey PRIMARY KEY (id);


--
-- Name: special_payments special_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_payments
    ADD CONSTRAINT special_payments_pkey PRIMARY KEY (id);


--
-- Name: stock_details stock_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_details
    ADD CONSTRAINT stock_detail_pkey PRIMARY KEY (id);


--
-- Name: stock_payments stock_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_payments
    ADD CONSTRAINT stock_payments_pkey PRIMARY KEY (id);


--
-- Name: stocks stock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT stock_pkey PRIMARY KEY (id);


--
-- Name: suppliers supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT supplier_pkey PRIMARY KEY (id);


--
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- Name: iq_category_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX iq_category_name ON public.categories USING btree (name);


--
-- Name: ix_category_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_category_product ON public.products USING btree (category_id);


--
-- Name: ix_cost_grass_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cost_grass_id ON public.grass_costs USING btree (grass_id);


--
-- Name: ix_detail_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_detail_product ON public.order_details USING btree (product_id);


--
-- Name: ix_grass_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_grass_customer ON public.grass USING btree (customer_id);


--
-- Name: ix_grass_detail_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_grass_detail_product ON public.grass_details USING btree (product_id);


--
-- Name: ix_grass_detail_unit; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_grass_detail_unit ON public.grass_details USING btree (unit_id);


--
-- Name: ix_grass_details; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_grass_details ON public.grass_details USING btree (grass_id);


--
-- Name: ix_kasbon_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_kasbon_customer ON public.kasbons USING btree (customer_id);


--
-- Name: ix_order_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_order_customer ON public.orders USING btree (customer_id);


--
-- Name: ix_order_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_order_customer_id ON public.special_orders USING btree (customer_id);


--
-- Name: ix_payment_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_payment_customer ON public.payments USING btree (customer_id);


--
-- Name: ix_sd_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sd_product ON public.stock_details USING btree (product_id);


--
-- Name: ix_sd_stock; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sd_stock ON public.stock_details USING btree (stock_id);


--
-- Name: ix_sd_unit; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sd_unit ON public.stock_details USING btree (unit_id);


--
-- Name: ix_special_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_special_order_id ON public.special_details USING btree (order_id);


--
-- Name: ix_special_payments_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_special_payments_customer_id ON public.special_payments USING btree (customer_id);


--
-- Name: ix_special_payments_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_special_payments_order ON public.special_payments USING btree (order_id);


--
-- Name: ix_special_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_special_product_id ON public.special_details USING btree (product_id);


--
-- Name: ix_special_unit_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_special_unit_id ON public.special_details USING btree (unit_id);


--
-- Name: ix_stock_payments; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_stock_payments ON public.stock_payments USING btree (stock_id);


--
-- Name: ix_stock_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_stock_product ON public.stock_details USING btree (stock_id, product_id);


--
-- Name: ix_stock_supplier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_stock_supplier ON public.stocks USING btree (supplier_id);


--
-- Name: ix_unit_content; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_unit_content ON public.units USING btree (content);


--
-- Name: uq_customer_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_customer_name ON public.customers USING btree (name);


--
-- Name: uq_order_detail; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_order_detail ON public.order_details USING btree (order_id, unit_id);


--
-- Name: uq_product_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_product_name ON public.products USING btree (name);


--
-- Name: uq_unit_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_unit_name ON public.units USING btree (product_id, name);


--
-- Name: ux_supplier_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_supplier_name ON public.suppliers USING btree (name);


--
-- Name: grass grass_after_delete_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER grass_after_delete_trig AFTER DELETE ON public.grass FOR EACH ROW EXECUTE FUNCTION public.grass_after_delete_func();


--
-- Name: grass grass_after_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER grass_after_insert_trig AFTER INSERT ON public.grass FOR EACH ROW EXECUTE FUNCTION public.grass_after_insert_func();


--
-- Name: grass grass_after_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER grass_after_update_trig AFTER UPDATE ON public.grass FOR EACH ROW EXECUTE FUNCTION public.grass_after_update_func();


--
-- Name: grass_costs grass_cost_aft_delete_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER grass_cost_aft_delete_trig AFTER DELETE ON public.grass_costs FOR EACH ROW EXECUTE FUNCTION public.grass_cost_after_delete_func();


--
-- Name: grass_costs grass_cost_aft_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER grass_cost_aft_insert_trig AFTER INSERT ON public.grass_costs FOR EACH ROW EXECUTE FUNCTION public.grass_cost_after_insert_func();


--
-- Name: grass_costs grass_cost_aft_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER grass_cost_aft_update_trig AFTER UPDATE ON public.grass_costs FOR EACH ROW EXECUTE FUNCTION public.grass_cost_after_update_func();


--
-- Name: grass_costs grass_cost_bef_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER grass_cost_bef_insert_trig BEFORE INSERT OR UPDATE OF qty, price ON public.grass_costs FOR EACH ROW EXECUTE FUNCTION public.grass_cost_before_insert_func();


--
-- Name: grass_details grass_detail_after_delete_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER grass_detail_after_delete_trig AFTER DELETE ON public.grass_details FOR EACH ROW EXECUTE FUNCTION public.grass_detail_after_delete_func();


--
-- Name: grass_details grass_detail_after_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER grass_detail_after_insert_trig AFTER INSERT ON public.grass_details FOR EACH ROW EXECUTE FUNCTION public.grass_detail_after_insert_func();


--
-- Name: grass_details grass_detail_after_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER grass_detail_after_update_trig AFTER UPDATE ON public.grass_details FOR EACH ROW EXECUTE FUNCTION public.grass_detail_after_update_func();


--
-- Name: grass_details grass_detail_before_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER grass_detail_before_insert_trig BEFORE INSERT OR UPDATE ON public.grass_details FOR EACH ROW EXECUTE FUNCTION public.grass_detail_before_insert_update_func();


--
-- Name: lunas lunas_aft_delete_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER lunas_aft_delete_trig AFTER DELETE ON public.lunas FOR EACH ROW EXECUTE FUNCTION public.lunas_delete_func();


--
-- Name: lunas lunas_aft_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER lunas_aft_insert_trig AFTER INSERT ON public.lunas FOR EACH ROW EXECUTE FUNCTION public.lunas_insert_func();


--
-- Name: lunas lunas_aft_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER lunas_aft_update_trig AFTER UPDATE ON public.lunas FOR EACH ROW EXECUTE FUNCTION public.lunas_update_func();


--
-- Name: order_details od_before_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER od_before_insert_trig BEFORE INSERT OR UPDATE ON public.order_details FOR EACH ROW EXECUTE FUNCTION public.od_before_insert_func();


--
-- Name: order_details od_delete_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER od_delete_trig AFTER DELETE ON public.order_details FOR EACH ROW EXECUTE FUNCTION public.od_delete_func();


--
-- Name: order_details od_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER od_insert_trig AFTER INSERT ON public.order_details FOR EACH ROW EXECUTE FUNCTION public.od_insert_func();


--
-- Name: order_details od_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER od_update_trig AFTER UPDATE ON public.order_details FOR EACH ROW EXECUTE FUNCTION public.od_update_func();


--
-- Name: orders order_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER order_insert_trig BEFORE INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.order_update_func();


--
-- Name: products product_stock_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER product_stock_update_trig BEFORE UPDATE OF first_stock ON public.products FOR EACH ROW EXECUTE FUNCTION public.product_stock_update_func();


--
-- Name: products product_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER product_update_trig AFTER UPDATE OF price ON public.products FOR EACH ROW EXECUTE FUNCTION public.product_update_func();


--
-- Name: stock_details sd_before_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER sd_before_insert_trig BEFORE INSERT OR UPDATE OF qty, content, price ON public.stock_details FOR EACH ROW EXECUTE FUNCTION public.sd_before_insert_func();


--
-- Name: stock_details sd_delete_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER sd_delete_trig AFTER DELETE ON public.stock_details FOR EACH ROW EXECUTE FUNCTION public.sd_delete_func();


--
-- Name: stock_details sd_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER sd_insert_trig AFTER INSERT ON public.stock_details FOR EACH ROW EXECUTE FUNCTION public.sd_insert_func();


--
-- Name: stock_details sd_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER sd_update_trig AFTER UPDATE ON public.stock_details FOR EACH ROW EXECUTE FUNCTION public.sd_update_func();


--
-- Name: special_details spd_aft_delete_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER spd_aft_delete_trig AFTER DELETE ON public.special_details FOR EACH ROW EXECUTE FUNCTION public.spd_aft_delete_func();


--
-- Name: special_details spd_aft_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER spd_aft_insert_trig AFTER INSERT ON public.special_details FOR EACH ROW EXECUTE FUNCTION public.spd_aft_insert_func();


--
-- Name: special_details spd_aft_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER spd_aft_update_trig AFTER UPDATE ON public.special_details FOR EACH ROW EXECUTE FUNCTION public.spd_aft_update_func();


--
-- Name: special_details spd_bef_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER spd_bef_insert_trig BEFORE INSERT OR UPDATE ON public.special_details FOR EACH ROW EXECUTE FUNCTION public.spd_bef_insert_func();


--
-- Name: special_orders spo_bef_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER spo_bef_insert_trig BEFORE INSERT ON public.special_orders FOR EACH ROW EXECUTE FUNCTION public.spo_bef_update_func();


--
-- Name: special_orders spo_bef_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER spo_bef_update_trig BEFORE UPDATE OF total, cash, payments ON public.special_orders FOR EACH ROW EXECUTE FUNCTION public.spo_bef_update_func();


--
-- Name: special_payments spo_payment_aft_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER spo_payment_aft_insert_trig AFTER INSERT ON public.special_payments FOR EACH ROW EXECUTE FUNCTION public.spo_payment_aft_insert_func();


--
-- Name: special_payments spo_payment_aft_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER spo_payment_aft_update_trig AFTER UPDATE OF nominal ON public.special_payments FOR EACH ROW EXECUTE FUNCTION public.spo_payment_aft_update_func();


--
-- Name: special_payments spo_payment_delete_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER spo_payment_delete_trig AFTER DELETE ON public.special_payments FOR EACH ROW EXECUTE FUNCTION public.spo_payment_delete_func();


--
-- Name: stock_payments stc_payment_delete_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER stc_payment_delete_trig AFTER DELETE ON public.stock_payments FOR EACH ROW EXECUTE FUNCTION public.sup_payment_delete_func();


--
-- Name: stock_payments stc_payment_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER stc_payment_insert_trig AFTER INSERT ON public.stock_payments FOR EACH ROW EXECUTE FUNCTION public.sup_payment_insert_func();


--
-- Name: stock_payments stc_payment_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER stc_payment_update_trig AFTER UPDATE OF nominal ON public.stock_payments FOR EACH ROW EXECUTE FUNCTION public.sup_payment_update_func();


--
-- Name: stocks stc_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER stc_update_trig BEFORE INSERT OR UPDATE OF cash, total, payments ON public.stocks FOR EACH ROW EXECUTE FUNCTION public.stc_update_func();


--
-- Name: products fk_category_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_category_product FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: grass fk_customer_grass; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grass
    ADD CONSTRAINT fk_customer_grass FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: kasbons fk_customer_kasbon; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kasbons
    ADD CONSTRAINT fk_customer_kasbon FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders fk_customer_orders; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_customer_orders FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments fk_customer_payment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_customer_payment FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_details fk_detail_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT fk_detail_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_details fk_detail_unit; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT fk_detail_unit FOREIGN KEY (unit_id) REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: grass_costs fk_grass_cost; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grass_costs
    ADD CONSTRAINT fk_grass_cost FOREIGN KEY (grass_id) REFERENCES public.grass(id) ON DELETE CASCADE;


--
-- Name: grass_details fk_grass_detail_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grass_details
    ADD CONSTRAINT fk_grass_detail_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: grass_details fk_grass_detail_unit; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grass_details
    ADD CONSTRAINT fk_grass_detail_unit FOREIGN KEY (unit_id) REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: grass_details fk_grass_details; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grass_details
    ADD CONSTRAINT fk_grass_details FOREIGN KEY (grass_id) REFERENCES public.grass(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_details fk_order_details; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT fk_order_details FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: units fk_product_unit; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT fk_product_unit FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_details fk_sd_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_details
    ADD CONSTRAINT fk_sd_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_details fk_sd_unit; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_details
    ADD CONSTRAINT fk_sd_unit FOREIGN KEY (unit_id) REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: special_payments fk_special_payments_customer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_payments
    ADD CONSTRAINT fk_special_payments_customer FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: special_payments fk_special_payments_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_payments
    ADD CONSTRAINT fk_special_payments_order FOREIGN KEY (order_id) REFERENCES public.special_orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_details fk_stock_detail; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_details
    ADD CONSTRAINT fk_stock_detail FOREIGN KEY (stock_id) REFERENCES public.stocks(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_payments fk_stock_payments; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_payments
    ADD CONSTRAINT fk_stock_payments FOREIGN KEY (stock_id) REFERENCES public.stocks(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stocks fk_supplier_stocks; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT fk_supplier_stocks FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lunas fx_customer_lunas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lunas
    ADD CONSTRAINT fx_customer_lunas FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: special_orders fx_customer_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_orders
    ADD CONSTRAINT fx_customer_order FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: special_details fx_special_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_details
    ADD CONSTRAINT fx_special_order FOREIGN KEY (order_id) REFERENCES public.special_orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: special_details fx_special_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_details
    ADD CONSTRAINT fx_special_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: special_details fx_special_unit; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_details
    ADD CONSTRAINT fx_special_unit FOREIGN KEY (unit_id) REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

