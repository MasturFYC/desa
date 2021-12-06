## TRANSACTIONS
___

```sh
drop function customer_get_special_transaction;
CREATE OR REPLACE FUNCTION public.customer_get_special_transaction(cust_id integer, lunasid integer)
 RETURNS TABLE(
  id integer,
  idx integer,
  trx_date timestamp without time zone,
  descriptions character varying,
  qty numeric,
  unit varchar(6),
  price numeric,
  debt numeric,
  cred numeric,
  saldo numeric) LANGUAGE plpgsql
AS $function$

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

$function$;

select * from customer_get_special_transaction(3,0);
```
```sh
drop function customer_get_transaction_detail;
CREATE OR REPLACE FUNCTION public.customer_get_transaction_detail(cust_id integer, lunasid integer)
 RETURNS TABLE(
  id integer,
  idx integer,
  trx_date timestamp without time zone,
  descriptions character varying,
  title character varying,
  qty numeric,
  unit varchar(6),
  price numeric,
  debt numeric,
  cred numeric,
  saldo numeric) LANGUAGE plpgsql
AS $function$

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
        g.descriptions, concat('Pembelian: #', g.id ) title,
        g.qty, g.unit_name unit, g.price price,
        0::numeric debt,
        g.total cred
        from grass g
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

$function$;

select * from customer_get_transaction_detail(2, 0);
```

```sh
create table lunas (
  id serial primary key not null,
  customer_id integer not null,
  name varchar(50) not null,
  descriptions varchar(128),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);
```
```sh
create index ix_lunas_customer_id on lunas (customer_id);
```
```sh
create unique index iq_lunas_name on lunas (name);
```
```sh
alter table lunas add constraint fx_customer_lunas
  foreign key (customer_id) references customers (id);
```
```sh
alter table orders
  add column lunas_id integer not null default 0;
```
```sh
alter table kasbons
  add column lunas_id integer not null default 0;
```
```sh
alter table payments
  add column lunas_id integer not null default 0;
```
```sh
alter table special_payments
  add column lunas_id integer not null default 0;
```
```sh
alter table special_orders
  add column lunas_id integer not null default 0;
```
```sh
alter table grass
  add column lunas_id integer not null default 0;
```
```sh
alter table kasbons add column ref_lunas_id integer not null default 0;
```
```sh
CREATE OR REPLACE FUNCTION
    lunas_insert_func()
    RETURNS trigger
    LANGUAGE plpgsql

AS $function$

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
$function$;
```
```sh
CREATE OR REPLACE FUNCTION
    lunas_update_func()
    RETURNS trigger
    LANGUAGE plpgsql

AS $function$

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
$function$;
```

```sh
CREATE OR REPLACE FUNCTION
    lunas_delete_func()
    RETURNS trigger
    LANGUAGE plpgsql

AS $function$

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
      where ref_lunas_id = OLD.id AND customer_id = OLD.customer_id;

    RETURN OLD;

END; 
$function$;
```
```sh
CREATE TRIGGER lunas_aft_insert_trig 
  after insert on lunas 
  for each row execute
  function lunas_insert_func();
```
```sh
CREATE TRIGGER lunas_aft_delete_trig
  after delete on lunas 
  for each row execute
  function lunas_delete_func();
```
```sh
CREATE TRIGGER lunas_aft_update_trig
  after update on lunas
  for each row execute
  function lunas_update_func();
```

```sh
CREATE FUNCTION public.sip_cust_balance_detail(cust_id integer, lunasid integer)
RETURNS TABLE(id integer, customer_id integer, descriptions character varying, trx_date timestamp without time zone, debt numeric, cred numeric, saldo numeric)
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
        g.total cred
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
```
```sh
CREATE TRIGGER lunas_aft_insert_trig 
  after insert on lunas 
  for each row execute
  function lunas_insert_func();
```
```sh
CREATE TRIGGER lunas_aft_delete_trig
  after delete on lunas 
  for each row execute
  function lunas_delete_func();
```

## ASK FOR USE

```sh
drop function sip_sup_balance_detail;
```
```sh
CREATE OR REPLACE FUNCTION public.sip_sup_balance_detail(sup_id integer)
 RETURNS TABLE(id integer, supplier_id integer, trx_ref character varying, descriptions character varying, trx_date timestamp without time zone, d> LANGUAGE plpgsql
AS $function$

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

$function$    
```
# OK

```sh
drop function piutang_balance_func;
```

```sh
CREATE OR REPLACE FUNCTION public.piutang_balance_func(cust_id integer, lunasId integer)
 RETURNS TABLE(id integer, descriptions character varying, debt numeric, cred numeric, saldo numeric)
 LANGUAGE plpgsql
AS $function$

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
     select 3, 'Pembelian', 0, coalesce(sum(c.total),0)
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

 $function$;
 ```