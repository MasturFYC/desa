drop function insert_product_func;
CREATE OR REPLACE FUNCTION public.insert_product_func(
    p_cat_id smallint
    , p_name varchar(50)
    , p_spec varchar(128)
    , p_price decimal(12,2)
    , p_stock decimal(10,2)
    , p_fstock decimal(10,2)
    , p_unit varchar(6)
)

    RETURNS table (
        id integer
        , category_id smallint
        , name varchar(50)
        , spec varchar(128)
        , price decimal(12,2)
        , stock decimal(10,2)
        , first_stock decimal(10,2)
        , unit varchar(6)
    ) AS $$

BEGIN

    return query
        INSERT INTO products (
          --  id,
            category_id,
            name,
            spec,
            price,
            stock,
            first_stock,
            unit)
        VALUES(
            -- nextval('product_seq'::regclass),
            p_cat_id::smallint,
            p_name,
            p_spec,
            p_price,
            p_stock,
            p_fstock,
            p_unit
        ) RETURNING products.id,
            products.category_id,
            products.name,
            products.spec,
            products.price,
            products.stock,
            products.first_stock,
            products.unit;


END

$$ LANGUAGE plpgsql;
