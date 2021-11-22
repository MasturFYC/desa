--
-- PostgreSQL database dump
--

-- Dumped from database version 13.4 (Ubuntu 13.4-1.pgdg20.04+1)
-- Dumped by pg_dump version 13.4 (Ubuntu 13.4-1.pgdg20.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: cust_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.cust_type AS ENUM (
    'Bandeng',
    'Rumput Laut'
);


ALTER TYPE public.cust_type OWNER TO postgres;

--
-- Name: grass_before_insert_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.grass_before_insert_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

NEW.total = NEW.qty * NEW.price;

RETURN NEW;

end; $$;


ALTER FUNCTION public.grass_before_insert_update_func() OWNER TO postgres;

--
-- Name: grass_detail_after_delete_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.grass_detail_after_delete_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

--raise notice 'value: %', NEW.subtotal;
update grass set
qty = qty - OLD.qty
where id = OLD.grass_id;

RETURN OLD;

end; $$;


ALTER FUNCTION public.grass_detail_after_delete_func() OWNER TO postgres;

--
-- Name: grass_detail_after_insert_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.grass_detail_after_insert_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

--raise notice 'value: %', NEW.subtotal;
update grass set
qty = qty + NEW.qty
where id = NEW.grass_id;

RETURN NEW;

end; $$;


ALTER FUNCTION public.grass_detail_after_insert_func() OWNER TO postgres;

--
-- Name: grass_detail_after_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.grass_detail_after_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

--raise notice 'value: %', NEW.subtotal;
update grass set
qty = qty + NEW.qty - OLD.qty
where id = NEW.grass_id;

RETURN NEW;

end; $$;


ALTER FUNCTION public.grass_detail_after_update_func() OWNER TO postgres;

--
-- Name: od_before_insert_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.od_before_insert_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

	--raise notice 'value: %', NEW.subtotal;
	NEW.real_qty = NEW.qty * NEW.content;
	NEW.subtotal = NEW.qty * NEW.price;

	RETURN NEW;

end; $$;


ALTER FUNCTION public.od_before_insert_func() OWNER TO postgres;

--
-- Name: od_delete_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.od_delete_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

	update products
	set stock = stock + OLD.real_qty
	WHERE id = OLD.product_id;

	update orders set
	total = total - OLD.subtotal
	where id = OLD.order_id;

	RETURN OLD;

end; $$;


ALTER FUNCTION public.od_delete_func() OWNER TO postgres;

--
-- Name: od_insert_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.od_insert_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

	--raise notice 'value: %', NEW.subtotal;

	update products
	set stock = stock - NEW.real_qty
	where id = NEW.product_id;

	update orders set total = total + NEW.subtotal where id = NEW.order_id;

	RETURN NEW;

end; $$;


ALTER FUNCTION public.od_insert_func() OWNER TO postgres;

--
-- Name: od_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.od_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$


begin

	update products
	set stock = stock - NEW.real_qty
	where id = NEW.product_id;

	update products 
	set stock = stock + OLD.real_qty
	where id = OLD.product_id;

	update orders
	set total = total + NEW.subtotal - OLD.subtotal
	-- remain_payment = remain_payment + NEW.subtotal - OLD.subtotal
	where id = NEW.order_id;

	return NEW;

end;

$$;


ALTER FUNCTION public.od_update_func() OWNER TO postgres;

--
-- Name: order_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.order_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

	NEW.remain_payment = NEW.total - NEW.payment;

	--raise notice 'Value: %', NEW.remain_payment;

	RETURN NEW;

end;
$$;


ALTER FUNCTION public.order_update_func() OWNER TO postgres;

--
-- Name: piutang_balance_func(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.piutang_balance_func(cust_id integer) RETURNS TABLE(id integer, descriptions character varying, cred numeric, debt numeric, saldo numeric)
    LANGUAGE plpgsql
    AS $$

begin

     drop table IF EXISTS temp_table;

     create temporary table temp_table(
         id integer,
         descriptions varchar(128),
         cred decimal(12,2),
         debt decimal(12,2)
     );

     insert into temp_table (id, descriptions, cred, debt)
     select 1, 'Piutang Barang', coalesce(sum(c.total),0), coalesce(sum(c.payment),0)
     from orders c
     where c.customer_id = cust_id;

     insert into temp_table (id, descriptions, cred, debt)
     select 2, 'Kasbon', coalesce(sum(c.total),0), 0
     from kasbons c
     where c.customer_id = cust_id;

     insert into temp_table (id, descriptions, cred, debt)
     select 3, 'Pembelian', 0, coalesce(sum(c.total),0)
     from grass c
     where c.customer_id = cust_id;

     insert into temp_table (id, descriptions, cred, debt)
     select 4, 'Cicilan', 0, coalesce(sum(c.total),0)
     from payments c
     where c.customer_id = cust_id;

     return query select
         c.id, c.descriptions, c.cred, c.debt, sum(c.cred - c.debt)
         over (order by c.id
         rows between unbounded preceding and current row) as saldo
         from temp_table as c;

 end;

 $$;


ALTER FUNCTION public.piutang_balance_func(cust_id integer) OWNER TO postgres;

--
-- Name: product_stock_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.product_stock_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

  --  raise notice 'test %', NEW.first_stock;
    NEW.stock = NEW.stock + NEW.first_stock - OLD.first_stock;

    RETURN NEW;

end; $$;


ALTER FUNCTION public.product_stock_update_func() OWNER TO postgres;

--
-- Name: product_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.product_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

declare buyPrice decimal(12,2);
begin

    buyPrice := NEW.price;

    update units set
	buy_price = buyPrice * content,
	price = (buyPrice * content) + ((buyPrice * content) * margin)
	where product_id = NEW.id;

    RETURN NEW;

end; $$;


ALTER FUNCTION public.product_update_func() OWNER TO postgres;

--
-- Name: sd_before_insert_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sd_before_insert_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

	--raise notice 'value: %', NEW.subtotal;
	NEW.real_qty = NEW.qty * NEW.content;
	NEW.subtotal = NEW.qty * NEW.price;

	RETURN NEW;

end; $$;


ALTER FUNCTION public.sd_before_insert_func() OWNER TO postgres;

--
-- Name: sd_delete_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sd_delete_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

	update products
	set stock = stock - OLD.real_qty
	WHERE id = OLD.product_id;

	update stocks set
	total = total - OLD.subtotal
	where id = OLD.stock_id;

	RETURN OLD;

end; $$;


ALTER FUNCTION public.sd_delete_func() OWNER TO postgres;

--
-- Name: sd_insert_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sd_insert_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

	--raise notice 'value: %', NEW.subtotal;

	update products
	set stock = stock + NEW.real_qty
	where id = NEW.product_id;

	update stocks set total = total + NEW.subtotal where id = NEW.stock_id;

	RETURN NEW;

end; $$;


ALTER FUNCTION public.sd_insert_func() OWNER TO postgres;

--
-- Name: sd_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sd_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$


begin

	update products
	set stock = stock + NEW.real_qty
	where id = NEW.product_id;

	update products 
	set stock = stock - OLD.real_qty
	where id = OLD.product_id;

	update stocks
	set total = total + NEW.subtotal - OLD.subtotal
	-- remain_payment = remain_payment + NEW.subtotal - OLD.subtotal
	where id = NEW.stock_id;

	return NEW;

end;

$$;


ALTER FUNCTION public.sd_update_func() OWNER TO postgres;

--
-- Name: stc_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.stc_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

NEW.remain_payment = NEW.total - (NEW.cash + NEW.payments);

--raise notice 'Value: %', NEW.remain_payment;

RETURN NEW;

end;
$$;


ALTER FUNCTION public.stc_update_func() OWNER TO postgres;

--
-- Name: customer_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customer_seq OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer DEFAULT nextval('public.customer_seq'::regclass) NOT NULL,
    name character varying(50) NOT NULL,
    street character varying(128),
    city character varying(50),
    phone character varying(25),
    customer_type public.cust_type DEFAULT 'Bandeng'::public.cust_type NOT NULL
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: order_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_seq OWNER TO postgres;

--
-- Name: grass; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grass (
    customer_id integer NOT NULL,
    id integer DEFAULT nextval('public.order_seq'::regclass) NOT NULL,
    descriptions character varying(128) NOT NULL,
    order_date timestamp without time zone NOT NULL,
    price numeric(12,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    qty numeric(10,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.grass OWNER TO postgres;

--
-- Name: grass_detail_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.grass_detail_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.grass_detail_seq OWNER TO postgres;

--
-- Name: grass_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grass_details (
    grass_id integer NOT NULL,
    id integer DEFAULT nextval('public.grass_detail_seq'::regclass) NOT NULL,
    qty numeric(10,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.grass_details OWNER TO postgres;

--
-- Name: kasbons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kasbons (
    id integer DEFAULT nextval('public.order_seq'::regclass) NOT NULL,
    customer_id integer NOT NULL,
    descriptions character varying(128) NOT NULL,
    kasbon_date timestamp without time zone NOT NULL,
    jatuh_tempo timestamp without time zone NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.kasbons OWNER TO postgres;

--
-- Name: order_detail_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_detail_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_detail_seq OWNER TO postgres;

--
-- Name: order_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_details (
    order_id integer NOT NULL,
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


ALTER TABLE public.order_details OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer DEFAULT nextval('public.order_seq'::regclass) NOT NULL,
    customer_id integer NOT NULL,
    order_date timestamp without time zone NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    payment numeric(12,2) DEFAULT 0 NOT NULL,
    remain_payment numeric(12,2) DEFAULT 0 NOT NULL,
    descriptions character varying(128) NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer DEFAULT nextval('public.order_seq'::regclass) NOT NULL,
    customer_id integer NOT NULL,
    descriptions character varying(50) NOT NULL,
    ref_id integer DEFAULT 0 NOT NULL,
    payment_date timestamp without time zone NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: product_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_seq OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer DEFAULT nextval('public.product_seq'::regclass) NOT NULL,
    name character varying(50) NOT NULL,
    spec character varying(50),
    price numeric(12,2) DEFAULT 0 NOT NULL,
    stock numeric(12,2) DEFAULT 0 NOT NULL,
    first_stock numeric(12,2) DEFAULT 0 NOT NULL,
    unit character varying(6) NOT NULL,
    update_notif boolean DEFAULT false NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: seq_stock; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seq_stock
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.seq_stock OWNER TO postgres;

--
-- Name: seq_supplier; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seq_supplier
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.seq_supplier OWNER TO postgres;

--
-- Name: stock_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_details (
    stock_id integer NOT NULL,
    id integer DEFAULT nextval('public.order_detail_seq'::regclass) NOT NULL,
    product_id integer NOT NULL,
    unit_id integer NOT NULL,
    qty numeric(10,2) DEFAULT 0 NOT NULL,
    content numeric(8,2) DEFAULT 0 NOT NULL,
    unit_name character varying(6) NOT NULL,
    real_qty numeric(10,2) DEFAULT 0 NOT NULL,
    price numeric(12,2) DEFAULT 0 NOT NULL,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.stock_details OWNER TO postgres;

--
-- Name: stocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stocks (
    id integer DEFAULT nextval('public.seq_stock'::regclass) NOT NULL,
    supplier_id integer NOT NULL,
    stock_num character varying(50) NOT NULL,
    stock_date timestamp without time zone NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    cash numeric(12,2) DEFAULT 0 NOT NULL,
    payments numeric(12,2) DEFAULT 0 NOT NULL,
    remain_payment numeric(12,2) DEFAULT 0 NOT NULL,
    descriptions character varying(128)
);


ALTER TABLE public.stocks OWNER TO postgres;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id integer DEFAULT nextval('public.seq_supplier'::regclass) NOT NULL,
    name character varying(50) NOT NULL,
    sales_name character varying(50),
    street character varying(128),
    city character varying(50),
    phone character varying(25),
    cell character varying(25),
    email character varying(50)
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: unit_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.unit_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.unit_seq OWNER TO postgres;

--
-- Name: units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.units (
    product_id integer DEFAULT 0 NOT NULL,
    id integer DEFAULT nextval('public.unit_seq'::regclass) NOT NULL,
    name character varying(50) NOT NULL,
    content numeric(8,2) DEFAULT 0 NOT NULL,
    price numeric(12,2) DEFAULT 0 NOT NULL,
    buy_price numeric(12,2) DEFAULT 0 NOT NULL,
    margin numeric(5,4) DEFAULT 0 NOT NULL
);


ALTER TABLE public.units OWNER TO postgres;

--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, name, street, city, phone, customer_type) FROM stdin;
2	Agung Priatna	RT. 14 / 06	Ds. Plumbon	085-5556-65656	Bandeng
1	Dhoni Armadi	Ds. Telukagung	Indramayu	085-5556-65656	Rumput Laut
\.


--
-- Data for Name: grass; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grass (customer_id, id, descriptions, order_date, price, total, qty) FROM stdin;
2	35	Pembelian Rumput Laut	2021-11-19 00:15:00	25000.00	3125000.00	125.00
\.


--
-- Data for Name: grass_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grass_details (grass_id, id, qty) FROM stdin;
35	8	65.00
35	7	60.00
\.


--
-- Data for Name: kasbons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kasbons (id, customer_id, descriptions, kasbon_date, jatuh_tempo, total) FROM stdin;
30	2	Kasbon	2021-11-17 11:06:00	2021-11-24 11:06:00	2500000.00
31	2	Kasbon Beli Terpal	2021-12-17 00:00:00	2021-12-24 00:00:00	1500000.00
\.


--
-- Data for Name: order_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_details (order_id, id, unit_id, qty, content, unit_name, real_qty, price, subtotal, buy_price, product_id) FROM stdin;
28	74	21	2.00	1.00	zak	2.00	325000.00	650000.00	250000.00	15
27	77	1	2.00	1.00	btl	2.00	15000.00	30000.00	10000.00	7
29	84	24	5.00	3.00	pak	15.00	5850.00	29250.00	4500.00	16
28	86	2	2.00	10.00	pak	20.00	130000.00	260000.00	100000.00	7
32	87	17	1.00	1.00	pcs	1.00	39000.00	39000.00	30000.00	1
32	88	21	1.00	1.00	zak	1.00	325000.00	325000.00	250000.00	15
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, customer_id, order_date, total, payment, remain_payment, descriptions) FROM stdin;
29	1	2021-11-17 00:46:00	29250.00	0.00	29250.00	Pembelian Barang
27	2	2021-11-16 21:25:00	30000.00	30000.00	0.00	Pembelian Barang
28	2	2021-11-16 23:15:00	910000.00	625000.00	285000.00	Pembelian Barang
32	2	2021-11-17 15:38:00	364000.00	300000.00	64000.00	Pembelian Barang
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, customer_id, descriptions, ref_id, payment_date, total) FROM stdin;
33	2	Cicilan Bayar Obat	0	2021-11-18 11:55:00	25000.00
34	2	Cicilan utang	0	2021-11-18 14:23:00	2500000.00
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, spec, price, stock, first_stock, unit, update_notif) FROM stdin;
16	eqweqwe	eqweqwe	1500.00	5.00	20.00	pcs	t
7	Abachel	250cc	10000.00	66.00	90.00	btl	t
1	EM 4 Perikanan	1 ltr	30000.00	89.00	100.00	pcs	f
15	Pakan Bandeng	Pelet KW1	250000.00	97.00	110.00	zak	t
\.


--
-- Data for Name: stock_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_details (stock_id, id, product_id, unit_id, qty, content, unit_name, real_qty, price, subtotal) FROM stdin;
\.


--
-- Data for Name: stocks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stocks (id, supplier_id, stock_num, stock_date, total, cash, payments, remain_payment, descriptions) FROM stdin;
3	1	x1	2021-11-22 00:00:00	10000.00	2500.00	2500.00	5000.00	test
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, name, sales_name, street, city, phone, cell, email) FROM stdin;
1	CV. Karya Baru	Mu'in	\N	Indramayu	qweqweqwe	\N	\N
2	CV. Marga Mekar	Mastur	Jl. Jend. Sudirman No. 155	Indramayu qwewqe	0856232154	5646565	mastur.st12@gmail.com
5	CV. Sejahtera	Sumarno, Sp.d	\N	qweqwe	\N	\N	\N
4	Gudang Garam, PT	Dhoni	qweqwewe	Jakartra	\N	\N	\N
6	Inti Persada, PT	qweqwe	eqweeeee	Indramayu	\N	\N	\N
3	aaaa	Suwarjo, SH	Jl. Jend. Sudirman No. 11/A-4	Jatibarang	+62234572275	\N	mastur.st12@gmail.com
\.


--
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.units (product_id, id, name, content, price, buy_price, margin) FROM stdin;
1	17	pcs	1.00	39000.00	30000.00	0.3000
1	19	ls	12.00	468000.00	360000.00	0.3000
1	20	pak	3.00	99999.00	90000.00	0.1111
15	21	zak	1.00	325000.00	250000.00	0.3000
15	22	pak3	3.00	950025.00	750000.00	0.2667
7	2	pak	10.00	130000.00	100000.00	0.3000
7	1	btl	1.00	15000.00	10000.00	0.5000
16	23	pcs	1.00	1950.00	1500.00	0.3000
16	24	pak	3.00	5850.00	4500.00	0.3000
7	25	ls	12.00	150000.00	120000.00	0.2500
\.


--
-- Name: customer_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customer_seq', 2, true);


--
-- Name: grass_detail_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grass_detail_seq', 8, true);


--
-- Name: order_detail_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_detail_seq', 88, true);


--
-- Name: order_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_seq', 35, true);


--
-- Name: product_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_seq', 16, true);


--
-- Name: seq_stock; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seq_stock', 3, true);


--
-- Name: seq_supplier; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seq_supplier', 38, true);


--
-- Name: unit_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.unit_seq', 25, true);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: grass_details grass_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grass_details
    ADD CONSTRAINT grass_details_pkey PRIMARY KEY (id);


--
-- Name: grass grass_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grass
    ADD CONSTRAINT grass_pkey PRIMARY KEY (id);


--
-- Name: kasbons kasbon_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kasbons
    ADD CONSTRAINT kasbon_pkey PRIMARY KEY (id);


--
-- Name: order_details order_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT order_details_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payment_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: stock_details stock_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_details
    ADD CONSTRAINT stock_detail_pkey PRIMARY KEY (id);


--
-- Name: stocks stock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT stock_pkey PRIMARY KEY (id);


--
-- Name: suppliers supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT supplier_pkey PRIMARY KEY (id);


--
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- Name: ix_detail_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_detail_product ON public.order_details USING btree (product_id);


--
-- Name: ix_grass_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_grass_customer ON public.grass USING btree (customer_id);


--
-- Name: ix_grass_detail; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_grass_detail ON public.grass_details USING btree (grass_id);


--
-- Name: ix_kasbon_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_kasbon_customer ON public.kasbons USING btree (customer_id);


--
-- Name: ix_order_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_order_customer ON public.orders USING btree (customer_id);


--
-- Name: ix_payment_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_payment_customer ON public.payments USING btree (customer_id);


--
-- Name: ix_sd_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sd_product ON public.stock_details USING btree (product_id);


--
-- Name: ix_sd_stock; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sd_stock ON public.stock_details USING btree (stock_id);


--
-- Name: ix_sd_unit; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sd_unit ON public.stock_details USING btree (unit_id);


--
-- Name: ix_stock_supplier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_stock_supplier ON public.stocks USING btree (supplier_id);


--
-- Name: ix_unit_content; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_unit_content ON public.units USING btree (content);


--
-- Name: uq_customer_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_customer_name ON public.customers USING btree (name);


--
-- Name: uq_order_detail; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_order_detail ON public.order_details USING btree (order_id, unit_id);


--
-- Name: uq_product_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_product_name ON public.products USING btree (name);


--
-- Name: uq_unit_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_unit_name ON public.units USING btree (product_id, name);


--
-- Name: ux_supplier_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_supplier_name ON public.suppliers USING btree (name);


--
-- Name: grass grass_before_insert_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER grass_before_insert_update_trig BEFORE INSERT OR UPDATE ON public.grass FOR EACH ROW EXECUTE FUNCTION public.grass_before_insert_update_func();


--
-- Name: grass_details grass_detail_after_delete_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER grass_detail_after_delete_trig AFTER DELETE ON public.grass_details FOR EACH ROW EXECUTE FUNCTION public.grass_detail_after_delete_func();


--
-- Name: grass_details grass_detail_after_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER grass_detail_after_insert_trig AFTER INSERT ON public.grass_details FOR EACH ROW EXECUTE FUNCTION public.grass_detail_after_insert_func();


--
-- Name: grass_details grass_detail_after_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER grass_detail_after_update_trig AFTER UPDATE ON public.grass_details FOR EACH ROW EXECUTE FUNCTION public.grass_detail_after_update_func();


--
-- Name: order_details od_before_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER od_before_insert_trig BEFORE INSERT OR UPDATE ON public.order_details FOR EACH ROW EXECUTE FUNCTION public.od_before_insert_func();


--
-- Name: order_details od_delete_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER od_delete_trig AFTER DELETE ON public.order_details FOR EACH ROW EXECUTE FUNCTION public.od_delete_func();


--
-- Name: order_details od_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER od_insert_trig AFTER INSERT ON public.order_details FOR EACH ROW EXECUTE FUNCTION public.od_insert_func();


--
-- Name: order_details od_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER od_update_trig AFTER UPDATE ON public.order_details FOR EACH ROW EXECUTE FUNCTION public.od_update_func();


--
-- Name: orders order_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER order_insert_trig BEFORE INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.order_update_func();


--
-- Name: products product_stock_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER product_stock_update_trig BEFORE UPDATE OF first_stock ON public.products FOR EACH ROW EXECUTE FUNCTION public.product_stock_update_func();


--
-- Name: products product_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER product_update_trig AFTER UPDATE OF price ON public.products FOR EACH ROW EXECUTE FUNCTION public.product_update_func();


--
-- Name: stock_details sd_before_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER sd_before_insert_trig BEFORE INSERT OR UPDATE OF qty, content, price ON public.stock_details FOR EACH ROW EXECUTE FUNCTION public.sd_before_insert_func();


--
-- Name: stock_details sd_delete_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER sd_delete_trig AFTER DELETE ON public.stock_details FOR EACH ROW EXECUTE FUNCTION public.sd_delete_func();


--
-- Name: stock_details sd_insert_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER sd_insert_trig AFTER INSERT ON public.stock_details FOR EACH ROW EXECUTE FUNCTION public.sd_insert_func();


--
-- Name: stock_details sd_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER sd_update_trig AFTER UPDATE ON public.stock_details FOR EACH ROW EXECUTE FUNCTION public.sd_update_func();


--
-- Name: stocks stc_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER stc_update_trig BEFORE INSERT OR UPDATE OF cash, total, payments ON public.stocks FOR EACH ROW EXECUTE FUNCTION public.stc_update_func();


--
-- Name: grass fk_customer_grass; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grass
    ADD CONSTRAINT fk_customer_grass FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: kasbons fk_customer_kasbon; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kasbons
    ADD CONSTRAINT fk_customer_kasbon FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders fk_customer_orders; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_customer_orders FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments fk_customer_payment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_customer_payment FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_details fk_detail_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT fk_detail_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_details fk_detail_unit; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT fk_detail_unit FOREIGN KEY (unit_id) REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_details fk_order_details; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT fk_order_details FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: units fk_product_unit; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT fk_product_unit FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_details fk_sd_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_details
    ADD CONSTRAINT fk_sd_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_details fk_sd_unit; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_details
    ADD CONSTRAINT fk_sd_unit FOREIGN KEY (unit_id) REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_details fk_stock_detail; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_details
    ADD CONSTRAINT fk_stock_detail FOREIGN KEY (stock_id) REFERENCES public.stocks(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stocks fk_supplier_stocks; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT fk_supplier_stocks FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

