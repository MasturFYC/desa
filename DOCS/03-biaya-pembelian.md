```sh
--- nextval('grass_costs_id_seq'::regclass)

create table grass_costs (
    grass_id integer not null,
    id serial not null,
    memo varchar(128) not null,
    qty decimal(12,2) not null default 0,
    unit varchar(6) not null,
    price decimal(12,2) not null default 0,
    subtotal decimal(12,2) not null default 0,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);
```
```sh
alter table grass_costs add primary key (id);

create index ix_cost_grass_id on grass_costs (grass_id);

alter table grass_costs add constraint fk_grass_cost
  foreign key (grass_id) references grass (id) on delete cascade;

```
```sh
CREATE OR REPLACE FUNCTION public.grass_cost_before_insert_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$

begin

        NEW.subtotal = NEW.qty * NEW.price;

        RETURN NEW;

end; $$;

```
```sh
CREATE OR REPLACE FUNCTION public.grass_cost_after_insert_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$

begin

    update grass set
        total = total - NEW.subtotal,
        cost = cost  + NEW.subtotal
        where id = NEW.grass_id;

    RETURN NEW;

end; $$;

```
CREATE OR REPLACE FUNCTION public.grass_cost_after_update_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$

begin

    update grass set
        total = total - NEW.subtotal + OLD.subtotal,
        cost = cost + NEW.subtotal - OLD.subtotal
        where id = NEW.grass_id;

    RETURN NEW;

end; $$;

```

```
CREATE OR REPLACE FUNCTION public.grass_cost_after_delete_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$

begin

    update grass set
        total = total + OLD.subtotal,
        cost = cost - OLD.subtotal
        where id = OLD.grass_id;

    RETURN OLD;

end; $$;

```
```sh

create trigger grass_cost_bef_insert_trig
    BEFORE INSERT OR UPDATE OF qty, price ON grass_costs
    FOR EACH ROW EXECUTE FUNCTION grass_cost_before_insert_func();

create trigger grass_cost_aft_insert_trig
    AFTER INSERT ON grass_costs
    FOR EACH ROW EXECUTE FUNCTION grass_cost_after_insert_func();

create trigger grass_cost_aft_update_trig
    AFTER UPDATE OF qty, price ON grass_costs
    FOR EACH ROW EXECUTE FUNCTION grass_cost_after_update_func();

create trigger grass_cost_aft_delete_trig
    AFTER DELETE ON grass_costs
    FOR EACH ROW EXECUTE FUNCTION grass_cost_after_delete_func();

```