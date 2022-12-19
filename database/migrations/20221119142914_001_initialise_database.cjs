var dotenv = require('dotenv');
const environment = process.env.NODE_ENV || 'development';
const dotenvPath = '.env.' + environment;
dotenv.config({path: dotenvPath, debug: true});

exports.up = async function(knex) {
   
    await knex.raw(`SET statement_timeout = 0;`);
    await knex.raw(`SET lock_timeout = 0;`);
    await knex.raw(`SET idle_in_transaction_session_timeout = 0;`);
    await knex.raw(`SET client_encoding = 'UTF8';`);
    await knex.raw(`SET standard_conforming_strings = on;`);
    //await knex.raw(`SELECT pg_catalog.set_config('search_path', '', false);`);
    await knex.raw(`SET check_function_bodies = false;`);
    await knex.raw(`SET xmloption = content;`);
    await knex.raw(`SET client_min_messages = warning;`);
    await knex.raw(`SET row_security = off;`);
    await knex.raw(`SET default_tablespace = '';`);
    await knex.raw(`SET default_table_access_method = heap;`);
    
    await knex.raw(`CREATE TABLE public.trans (
        id integer NOT NULL,
        hash character varying(66) NOT NULL,
        status integer NOT NULL,
        amount character varying(36) NOT NULL,
        user_id character(36)
    );`);
    
    
    await knex.raw(`ALTER TABLE public.trans OWNER TO postgres;`);
    
    
    await knex.raw(`CREATE SEQUENCE public.trans_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;`);
    
    
    await knex.raw(`ALTER TABLE public.trans_id_seq OWNER TO postgres;`);


    await knex.raw(`ALTER SEQUENCE public.trans_id_seq OWNED BY public.trans.id;`);


    await knex.raw(`CREATE TABLE public.trans_init_eth (
        id integer NOT NULL,
        hash character varying(66) NOT NULL,
        status integer NOT NULL,
        amount character varying(36) NOT NULL,
        user_id character(36)
    );`);
    
    
    await knex.raw(`ALTER TABLE public.trans_init_eth OWNER TO postgres;`);
    
    
    await knex.raw(`CREATE SEQUENCE public.trans_init_eth_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;`);
    
    
        await knex.raw(`ALTER TABLE public.trans_init_eth_id_seq OWNER TO postgres;`);
    
        await knex.raw(`ALTER SEQUENCE public.trans_init_eth_id_seq OWNED BY public.trans_init_eth.id;`);
    
        await knex.raw(`CREATE TABLE public.userwallet (
        id integer NOT NULL,
        address character varying(42) NOT NULL,
        private character varying(66) NOT NULL,
        user_id character(36) NOT NULL
    );`);
    
    
    await knex.raw(`ALTER TABLE public.userwallet OWNER TO postgres;`);
    
    await knex.raw(`CREATE SEQUENCE public.userwallet_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;`);
    
    await knex.raw(`ALTER TABLE public.userwallet_id_seq OWNER TO postgres;`);

    await knex.raw(`ALTER SEQUENCE public.userwallet_id_seq OWNED BY public.userwallet.id;`);

    await knex.raw(`ALTER TABLE ONLY public.trans ALTER COLUMN id SET DEFAULT nextval('public.trans_id_seq'::regclass);`);

    await knex.raw(`ALTER TABLE ONLY public.trans_init_eth ALTER COLUMN id SET DEFAULT nextval('public.trans_init_eth_id_seq'::regclass);`);

    await knex.raw(`ALTER TABLE ONLY public.userwallet ALTER COLUMN id SET DEFAULT nextval('public.userwallet_id_seq'::regclass);`);

    await knex.raw(`ALTER TABLE ONLY public.trans_init_eth
    ADD CONSTRAINT trans_init_eth_pkey PRIMARY KEY (id);`);

    await knex.raw(`ALTER TABLE ONLY public.trans
    ADD CONSTRAINT trans_pkey PRIMARY KEY (id);`);

    await knex.raw(`ALTER TABLE ONLY public.userwallet
    ADD CONSTRAINT userwallet_pkey PRIMARY KEY (user_id);`);

    await knex.raw(`ALTER TABLE ONLY public.trans_init_eth
    ADD CONSTRAINT trans_init_eth_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.userwallet(user_id);`);

    await knex.raw(`ALTER TABLE ONLY public.trans
    ADD CONSTRAINT trans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.userwallet(user_id);`);

    await knex.raw(`INSERT INTO userwallet (address, private, user_id) VALUES (\'${process.env.ADMIN_ADDRESS}\', \'${process.env.ADMIN_PRIVATE}\', \'${process.env.ADMIN_USER_ID}\');`);
};

exports.down = async function(knex) {
    await knex.raw(`DROP TABLE public.trans`);
    await knex.raw(`DROP TABLE public.trans_id_seq`);
    await knex.raw(`DROP TABLE public.userwallet`);

    await knex.raw(`DROP SEQUENCE public.trans_init_eth_id_seq`);
    await knex.raw(`DROP SEQUENCE public.trans_init_eth_id_seq`);
    await knex.raw(`DROP SEQUENCE public.public.userwallet_id_seq`);
};
