drop function public.get_profit_by_order_id;

CREATE OR REPLACE FUNCTION public.get_profit_by_order_id(p_id integer, p_type smallint)
  RETURNS table (
    id integer,
    product_name varchar(50),
    buy_price decimal(12, 2),
    sale_price decimal(12, 2),
    discount decimal(12, 2),
    qty decimal(12, 2),
    unit varchar(6),
    profit decimal(12, 2)
  ) AS $$

BEGIN

  if p_type = 0 then
    return query select
      d.id,
      dp.name:: varchar(50) product_name,
      d.buy_price buy_price,
      d.price sale_price,
      d.discount discount,
      d.qty qty,
      d.unit_name unit,
      ((d.price - d.buy_price - d.discount) * d.qty):: decimal(12, 2) as profit
    from
      order_details d
      inner join products dp on dp.id = d.product_id
      inner join orders od on od.id = d.order_id
    where od.id = p_id;
  else
    return query select
      d.id,
      dp.name:: varchar(50) product_name,
      d.buy_price buy_price,
      d.price sale_price,
      0:: decimal(12, 2) discount,
      d.qty qty,
      d.unit_name unit,
      ((d.price - d.buy_price) * d.qty):: decimal(12, 2) as profit
    from
      special_details d
      inner join products dp on dp.id = d.product_id
      inner join special_orders od on od.id = d.order_id
    where od.id = p_id;
  end if;

END $$ LANGUAGE plpgsql;