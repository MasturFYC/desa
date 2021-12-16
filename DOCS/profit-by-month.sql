CREATE OR REPLACE FUNCTION public.get_profit_by_month(p_year smallint, p_month smallint) RETURNS table (
  id integer
  , order_date varchar(11)
  , buy_price decimal(12,2)
  , sale_price decimal(12,2)
  , subtotal decimal(12,2)
  , discount decimal(12,2)  
  , profit decimal(12,2)
) AS $$

BEGIN

     return query with recursive trx as (
       select
        EXTRACT(DAY FROM od.order_date)::integer id,
        to_char(od.order_date, 'YYYY-MM-DD')::varchar(11) order_date,
        (d.buy_price * d.qty)::decimal(12,2) buy_price,
        (d.price * d.qty)::decimal(12,2) sale_price,
        ((d.price - d.buy_price) * d.qty)::decimal(12,2) subtotal,
        (d.discount * d.qty)::decimal(12,2) discount,
        ((d.price - d.buy_price - d.discount) * d.qty)::decimal(12,2) as profit
       from order_details d 
       inner join products dp on dp.id = d.product_id
       inner join orders od on od.id = d.order_id
       where EXTRACT(YEAR FROM od.order_date) = p_year AND
       (EXTRACT(MONTH FROM od.order_date) = p_month OR p_month = 0)
       
       union all

      select
        EXTRACT(DAY FROM od.created_at)::integer id,
        to_char(od.created_at, 'YYYY-MM-DD')::varchar(11) order_date,
        (d.buy_price * d.qty)::decimal(12,2) buy_price,
        (d.price * d.qty)::decimal(12,2) sale_price,
        ((d.price - d.buy_price) * d.qty)::decimal(12,2) subtotal,
        0::decimal(12,2) discount,
        ((d.price - d.buy_price) * d.qty)::decimal(12,2) as profit
       from special_details d 
       inner join products dp on dp.id = d.product_id
       inner join special_orders od on od.id = d.order_id
       where EXTRACT(YEAR FROM od.created_at) = p_year AND
       (EXTRACT(MONTH FROM od.created_at) = p_month OR p_month = 0)

     )

     select t.id, t.order_date,
        sum(t.buy_price),
        sum(t.sale_price),
        sum(t.subtotal),
        sum(t.discount),
        sum(t.profit)
     from trx t
     group by t.id, t.order_date
     order by t.id;

END

$$ LANGUAGE plpgsql;
---drop function public.get_profit_by_month;