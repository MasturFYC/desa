## PRODUCT

```sh
CREATE OR REPLACE FUNCTION public.product_get_transaction_detail(prod_id integer)
 RETURNS TABLE(
  id integer,
  trx_date character varying (10),
  faktur character varying (60),
  name character varying (50),
  real_qty numeric,
  unit_name character varying (6),
  debt numeric,
  cred numeric,
  saldo numeric) LANGUAGE plpgsql
AS $function$

begin

    return query with recursive trx as (

        select 0 id, '-'::character varying(10) trx_date,
          '-'::character varying(60) faktur, 'Stock Awal'::character varying(50) as name,
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

        select d.id, to_char(o.order_date, 'DD-MM-YYYY')::character varying(10) trx_date,
          concat('ORDER #', o.id)::character varying (60) faktur, c.name,
         -d.real_qty, d.unit_name, 0 debt, d.qty cred
        from order_details d
        inner join orders o on o.id = d.order_id
        inner join customers c on c.id = o.customer_id
        where d.product_id = prod_id

    )

    select t.id, t.trx_date, t.faktur, t.name, t.real_qty, t.unit_name,
        t.debt,
        t.cred,
        sum(t.real_qty)
        over (order by t.id rows between unbounded preceding and current row) as saldo
    from trx t
    order by t.id;

end;

$function$;

select * from product_get_transaction_detail(1);
```