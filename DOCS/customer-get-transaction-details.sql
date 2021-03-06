CREATE OR REPLACE FUNCTION public.customer_get_transaction_detail(cust_id integer, lunasid integer)
    RETURNS TABLE(
        id integer,
        idx integer,
        trx_date timestamp with time zone,
        descriptions character varying,
        title character varying,
        qty numeric,
        unit character varying,
        price numeric,
        debt numeric,
        cred numeric,
        saldo numeric
    )
    LANGUAGE plpgsql
    AS $$

BEGIN

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

     -- /*
      -- select g.id, 4 idx, g.order_date trx_date,
      --  concat(gp.name, case when g.total_div > 0 then ' *' else '' end) descriptions, concat('Pembelian: #', g.id ) title,
      --  gd.qty, gd.unit_name unit, gd.price price,
      --  0::numeric debt,
      --  gd.subtotal::numeric cred
     --  (gd.subtotal - (gd.subtotal * ( ( (g.total_div+coalesce(c.total,0)) / ( g.total + coalesce(c.total,0) ) ) ) ) )::numeric cred
     --   from grass_details gd
     --   inner join products gp on gp.id = gd.product_id
     --   inner join grass g on g.id = gd.grass_id
     --   left join (select c.grass_id id, sum(c.subtotal) total from grass_costs c group by c.grass_id) c
     --   on c.id = g.id
     --   where g.customer_id = cust_id AND g.lunas_id = lunasid
     -- */

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

    select ROW_NUMBER() OVER (ORDER BY t.id, t.idx)::integer,
        t.id,
        t.trx_date,
        t.descriptions, t.title, t.qty, t.unit, t.price,
        t.debt::decimal(12,2),
        t.cred::decimal(12,2),
        sum(t.debt - t.cred)
        over (order by t.id, t.idx rows between unbounded preceding and current row)::decimal(12,2) as saldo
    from trx t
    order by t.id, t.idx;

END;

$$;
