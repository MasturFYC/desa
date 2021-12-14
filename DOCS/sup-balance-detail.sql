drop function public.sip_sup_balance_detail;
CREATE OR REPLACE FUNCTION public.sip_sup_balance_detail(sup_id integer)
 RETURNS TABLE(id integer, supplier_id integer, trx_ref character varying,
descriptions character varying, trx_date timestamp with time zone,
debt numeric, cred numeric, saldo numeric)
 LANGUAGE plpgsql
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

