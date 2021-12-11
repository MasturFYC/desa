
```sh
alter table grass drop column price;
alter table grass drop column product_id;
alter table grass drop column unit_id;
alter table grass drop column buy_price;
alter table grass drop column content;
alter table grass drop column unit_name;
alter table grass drop column real_qty;
alter table grass add column partner_id integer not null default 0;
alter table grass add column cost decimal(12,2) not null default 0;
alter table special_orders add column surat_jalan varchar(50) not null default '-';
drop trigger grass_before_insert_update_trig on grass;
drop function grass_before_insert_update_func;
drop table grass_details;
alter table customers drop column customer_div;
```
```sh
CREATE OR REPLACE FUNCTION public.get_customer_div(customer_id integer)
 RETURNS record
 LANGUAGE plpgsql
AS $$
        DECLARE ret RECORD;
BEGIN

        SELECT c.name INTO ret
        FROM customers c
        WHERE c.id = customer_id;

        return ret;

END;
$$;
```
```sh
CREATE TABLE public.grass_details (
    grass_id integer NOT NULL,
    id integer DEFAULT nextval('public.order_detail_seq'::regclass) NOT NULL,
    unit_id integer NOT NULL,
    qty numeric(10,2) DEFAULT 0 NOT NULL,
    content numeric(8,2) DEFAULT 0 NOT NULL,
    unit_name character varying(6) NOT NULL,
    real_qty numeric(10,2) DEFAULT 0 NOT NULL,
    price numeric(12,2) DEFAULT 0 NOT NULL,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    buy_price numeric(12,2) DEFAULT 0 NOT NULL,
    product_id integer NOT NULL
);
```
```sh
alter table grass_details
    add primary key (id);
create index ix_grass_details
    on grass_details(grass_id);
create index ix_grass_detail_product
    on grass_details(product_id);
create index ix_grass_detail_unit
    on grass_details(unit_id);
alter table grass_details add constraint fk_grass_details
    foreign key (grass_id) references grass (id)
    on delete restrict on update cascade;
alter table grass_details add constraint fk_grass_detail_product
    foreign key (product_id) references products (id)
    on delete restrict on update cascade;
alter table grass_details add constraint fk_grass_detail_unit
    foreign key (unit_id) references units (id)
    on delete restrict on update cascade;
```

```sh
alter table units add column set_default boolean default false;
```
```sh
alter table order_details add column discount decimal(12,2) not null default 0;
```