SPECIAL ORDER
---

```sh
create table special_orders (
  id integer default nextval('order_seq'::regclass),
  customer_id integer not null,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  packaged_at timestamp not null default now(),
  shipped_at timestamp not null default now(),
  driver_name varchar(50) not null,
  police_number varchar(15) not null,
  street varchar(128) not null,
  city varchar(50) not null,
  phone varchar(25) not null,
  total decimal(12,2) not null default 0,
  cash decimal(12,2) not null default 0,
  payments decimal(12,2) not null default 0,
  remain_payment decimal(12,2) not null default 0,
  descriptions varchar(128)
);
```
```sh
alter table special_orders add primary key(id);

create index ix_order_customer_id on special_orders (customer_id);

alter table special_orders add constraint fx_customer_order foreign key (customer_id) references customers (id) on update cascade on delete restrict;
```
```sh
create table special_details (
  order_id integer not null,
  id integer default nextval('order_detail_seq'::regclass),
  product_id integer not null,
  unit_id integer not null,
  qty decimal(10,2) not null,
  unit_name character varying(6) not null,
  price decimal(12,2) not null default 0,
  subtotal decimal(12,2) not null default 0,
  content decimal(8,2) not null default 0,
  real_qty decimal(10,2) not null default 0,
  buy_price decimal(12,2) not null default 0  
);
```

```sh
alter table special_details add primary key(id);

create index ix_special_order_id on special_details (order_id);

create index ix_special_product_id on special_details (product_id);

create index ix_special_unit_id on special_details (unit_id);

alter table special_details add constraint fx_special_product foreign key (product_id) references products (id) on update cascade on delete restrict;

alter table special_details add constraint fx_special_order foreign key (order_id) references special_orders (id) on update cascade on delete restrict;

alter table special_details add constraint fx_special_unit foreign key (unit_id) references units (id) on update cascade on delete restrict;
```

```sh
CREATE OR REPLACE FUNCTION spo_bef_update_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$

begin

  NEW.remain_payment = NEW.total - NEW.cash - NEW.payments;
  NEW.updated_at = now();
  
  RETURN NEW;

end;
$function$;
```

```sh
create trigger spo_bef_insert_trig before insert on special_orders FOR EACH ROW EXECUTE FUNCTION spo_bef_update_func();
create trigger spo_bef_update_trig before update of total, cash, payments on special_orders FOR EACH ROW EXECUTE FUNCTION spo_bef_update_func();
```

```sh
CREATE OR REPLACE FUNCTION spd_bef_insert_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$

begin

  --raise notice 'value: %', NEW.subtotal;
  NEW.real_qty = NEW.qty * NEW.content;
  NEW.subtotal = NEW.qty * NEW.price;

  RETURN NEW;

end; $function$;
```
```sh
CREATE OR REPLACE FUNCTION public.spd_aft_delete_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$

begin

  update products set
  stock = stock + OLD.real_qty
  WHERE id = OLD.product_id;

  update special_orders set
  total = total - OLD.subtotal
  where id = OLD.order_id;

  RETURN OLD;

end; $function$;
```
```sh
CREATE OR REPLACE FUNCTION public.spd_aft_insert_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$

begin

  --raise notice 'value: %', NEW.subtotal;

    update products set
    stock = stock - NEW.real_qty
    where id = NEW.product_id;

    update special_orders set
    total = total + NEW.subtotal
    where id = NEW.order_id;

    RETURN NEW;

end; $function$;
```

```sh
CREATE OR REPLACE FUNCTION spd_aft_update_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$

begin

    update special_orders set
    total = total + NEW.subtotal - OLD.subtotal
    where id = NEW.order_id;

    if OLD.product_id = NEW.product_id then

      update products set
      stock = stock + OLD.real_qty - NEW.real_qty
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

$function$;
```

```sh
create trigger spd_bef_insert_trig
    BEFORE INSERT OR UPDATE ON special_details
    FOR EACH ROW EXECUTE FUNCTION spd_bef_insert_func();

create trigger spd_aft_delete_trig
    AFTER DELETE ON special_details
    FOR EACH ROW EXECUTE FUNCTION spd_aft_delete_func();

create trigger spd_aft_insert_trig
    AFTER INSERT ON special_details
    FOR EACH ROW EXECUTE FUNCTION spd_aft_insert_func();

create trigger spd_aft_update_trig
    AFTER UPDATE ON special_details
    FOR EACH ROW EXECUTE FUNCTION spd_aft_update_func();
```