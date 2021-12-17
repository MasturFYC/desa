drop function  public.get_profit_by_date_order;
CREATE OR REPLACE FUNCTION public.get_profit_by_date_order(p_date varchar(50)) RETURNS table (
  id integer
  , order_type smallint
  , customer_name varchar(50)
  , buy_price decimal(12,2)
  , sale_price decimal(12,2)
  , subtotal decimal(12,2)
  , discount decimal(12,2)  
  , profit decimal(12,2)
) AS $$

  DECLARE startdate timestamp with time zone;
  DECLARE enddate timestamp with time zone;

BEGIN

  select to_timestamp(concat(substring(p_date, 0, 11), ' 00:00'), 'YYYY-MM-DD HH24:MI')::timestamp with time zone into startdate;
  select to_timestamp(concat(substring(p_date, 0, 11), ' 23:59'), 'YYYY-MM-DD HH24:MI')::timestamp with time zone into enddate;

     return query with recursive trx as (
       select
        od.id,
        0::smallint order_type,
--        to_char(od.order_date, 'YYYY-MM-DD')::varchar(11) order_date,
        oc.name::varchar(50) customer_name,
        sum(d.buy_price * d.qty)::decimal(12,2) buy_price,
        sum(d.price * d.qty)::decimal(12,2) sale_price,
        sum((d.price - d.buy_price) * d.qty)::decimal(12,2) subtotal,
        sum(d.discount * d.qty)::decimal(12,2) discount,
        sum((d.price - d.buy_price - d.discount) * d.qty)::decimal(12,2) as profit
       from order_details d 
       inner join orders od on od.id = d.order_id
       inner join customers oc on oc.id = od.customer_id
       where od.order_date >= startdate
       and od.order_date <= enddate
       group by od.id
       -- , to_char(od.order_date, 'YYYY-MM-DD')::varchar(11)
       , oc.name
       
       union all

      select
        od.id,
        1::smallint order_type,
--        to_char(od.created_at, 'YYYY-MM-DD')::varchar(11) order_date,
        oc.name::varchar(50) customer_name,
        sum(d.buy_price * d.qty)::decimal(12,2) buy_price,
        sum(d.price * d.qty)::decimal(12,2) sale_price,
        sum((d.price - d.buy_price) * d.qty)::decimal(12,2) subtotal,
        0::decimal(12,2) discount,
        sum((d.price - d.buy_price) * d.qty)::decimal(12,2) as profit
       from special_details d 
       inner join special_orders od on od.id = d.order_id
       inner join customers oc on oc.id = od.customer_id
       where od.created_at >= startdate
       and od.created_at <= enddate
       group by od.id
       -- , to_char(od.created_at, 'YYYY-MM-DD')::varchar(11)
       , oc.name

     )

     select t.id, t.order_type, t.customer_name,
        t.buy_price,
        t.sale_price,
        t.subtotal,
        t.discount,
        t.profit
     from trx t
     -- group by t.id, t.order_date, t.customer_name
     order by t.id;

END

$$ LANGUAGE plpgsql;
