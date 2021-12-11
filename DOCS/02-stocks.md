```sh
alter table stock_details
  add column discount decimal(12,2)
  not null default 0;

```
```sh
CREATE OR REPLACE FUNCTION public.sd_before_insert_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$

begin

        --raise notice 'value: %', NEW.subtotal;
        NEW.real_qty = NEW.qty * NEW.content;
        NEW.subtotal = NEW.qty * (NEW.price - NEW.discount);

        RETURN NEW;

end; $$;
```