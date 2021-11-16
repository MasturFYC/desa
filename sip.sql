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
	set stock = stock - (OLD.real_qty), update_notif = false
	WHERE id = OLD.product_id;

	update orders set
	total = total - OLD.subtotal
	--, remain_payment = remain_payment - OLD.subtotal
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
	set stock = stock - NEW.real_qty, update_notif = false
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
	set stock = stock - NEW.real_qty, update_notif = false
	where id = NEW.product_id;

	update products 
	set stock = stock + OLD.real_qty, update_notif = false
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
-- Name: product_update_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.product_update_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

declare buyPrice decimal(12,2);
begin

    buyPrice := NEW.price;


    IF (NEW.update_notif = true) THEN
 	-- raise notice 'notif %', NEW.update_notif;
        update units set 
	buy_price = buyPrice * content, 
	price = (buyPrice * content) + ((buyPrice * content) * margin) 
	where product_id = NEW.id;
    END IF;

    RETURN NEW;

end; $$;


ALTER FUNCTION public.product_update_func() OWNER TO postgres;

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
-- Data for Name: order_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_details (order_id, id, unit_id, qty, content, unit_name, real_qty, price, subtotal, buy_price, product_id) FROM stdin;
25	69	22	1.00	3.00	pak3	3.00	950000.00	950000.00	750000.00	15
25	70	1	1.00	1.00	btl	1.00	15000.00	15000.00	10000.00	7
26	67	22	2.00	3.00	pak3	6.00	950000.00	1900000.00	750000.00	15
26	71	17	10.00	1.00	pcs	10.00	39000.00	390000.00	30000.00	1
25	65	19	1.00	12.00	ls	12.00	468000.00	468000.00	360000.00	1
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, customer_id, order_date, total, payment, remain_payment, descriptions) FROM stdin;
25	2	2021-11-16 14:23:00	1433000.00	0.00	1433000.00	Piutang Pakan
26	2	2021-11-16 15:32:00	2290000.00	0.00	2290000.00	Pembelian Pakan
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, spec, price, stock, first_stock, unit, update_notif) FROM stdin;
7	Abachel	250cc	10000.00	-2.00	15.00	btl	f
15	Pakan Bandeng	Pelet KW1	250000.00	57.00	50.00	zak	f
1	EM 4 Perikanan	1 ltr	30000.00	-261.00	15.00	pcs	f
\.


--
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.units (product_id, id, name, content, price, buy_price, margin) FROM stdin;
7	2	pak	10.00	130000.00	100000.00	0.3000
7	1	btl	1.00	15000.00	10000.00	0.5000
1	17	pcs	1.00	39000.00	30000.00	0.3000
1	19	ls	12.00	468000.00	360000.00	0.3000
1	20	pak	3.00	99999.00	90000.00	0.1111
15	21	zak	1.00	325000.00	250000.00	0.3000
15	22	pak3	3.00	950000.00	750000.00	0.2667
\.


--
-- Name: customer_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customer_seq', 2, true);


--
-- Name: order_detail_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_detail_seq', 71, true);


--
-- Name: order_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_seq', 26, true);


--
-- Name: product_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_seq', 15, true);


--
-- Name: unit_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.unit_seq', 22, true);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


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
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


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
-- Name: ix_order_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_order_customer ON public.orders USING btree (customer_id);


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
-- Name: products product_update_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER product_update_trig BEFORE INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.product_update_func();


--
-- Name: orders fk_customer_orders; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_customer_orders FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


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
-- PostgreSQL database dump complete
--

