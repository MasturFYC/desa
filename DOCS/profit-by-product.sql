-- alter table orders alter column order_date type timestamp with time zone;
--alter table special_orders alter column created_at type timestamp with time zone;
--alter table special_orders alter column created_at type timestamp with time zone;
-- drop function get_product_profit_func;
CREATE OR REPLACE FUNCTION public.get_product_profit_func(
  date_from varchar(25),
  date_to varchar(25)
  ) RETURNS table (
  id integer
  , order_date timestamp with time zone
  , name varchar(50)
  , spec varchar(128)
  , buy_price decimal(12,2)
  , sale_price decimal(12,2)
  , discount decimal(12,2)
  , profit decimal(12,2)
  , qty decimal(10,2)
  , unit varchar(6)
  , subtotal decimal(12,2)
) AS $$

  DECLARE startdate timestamp with time zone;
  DECLARE enddate timestamp with time zone;

BEGIN

  select to_timestamp(concat(substring(date_from, 0, 11), ' 00:00:00'), 'YYYY-MM-DD HH24:MI')::timestamp with time zone into startdate;
  select to_timestamp(concat(substring(date_to, 0, 11), ' 23:59:59'), 'YYYY-MM-DD HH24:MI')::timestamp with time zone into enddate;


    -- raise notice '% - %', startdate, enddate;

     return query with recursive trx as (
       select
        od.id, od.created_at order_date, dp.name, dp.spec,
        d.buy_price, d.price sale_price, 0::decimal(12,2) discount,
        d.price - d.buy_price as profit, 
        d.qty, d.unit_name unit
       from special_details d 
       inner join products dp on dp.id = d.product_id
       inner join special_orders od on od.id = d.order_id
       where od.created_at >= startdate
       and od.created_at <= enddate
     )

     select t.id, t.order_date, t.name, t.spec,
     t.buy_price, t.sale_price, t.discount, t.profit,
     t.qty, t.unit, (t.profit * t.qty)::decimal(12,2) subtotal
     from trx t
     order by t.id;

END

$$ LANGUAGE plpgsql;
