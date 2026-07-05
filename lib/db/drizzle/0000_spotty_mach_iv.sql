CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"nome" text NOT NULL,
	"codigo_alianca" text NOT NULL,
	"resumo" jsonb,
	"enviado_hoje" integer DEFAULT 0 NOT NULL,
	"data_envio" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "players_device_id_unique" UNIQUE("device_id"),
	CONSTRAINT "players_codigo_alianca_unique" UNIQUE("codigo_alianca")
);
--> statement-breakpoint
CREATE TABLE "alliances" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"ally_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "alliances_player_ally_unq" UNIQUE("player_id","ally_id")
);
--> statement-breakpoint
CREATE TABLE "exchanges" (
	"id" serial PRIMARY KEY NOT NULL,
	"tipo" text DEFAULT 'recursos' NOT NULL,
	"from_player_id" integer NOT NULL,
	"to_player_id" integer NOT NULL,
	"remetente_nome" text NOT NULL,
	"conteudo" jsonb,
	"morador" jsonb,
	"prazo_dias" integer,
	"morreu" boolean DEFAULT false NOT NULL,
	"origem_exchange_id" integer,
	"status" text DEFAULT 'pendente' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"received_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "bot_citadels" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"nome" text NOT NULL,
	"dia" integer NOT NULL,
	"andar" integer NOT NULL,
	"populacao" integer NOT NULL,
	"profissoes" jsonb NOT NULL,
	"poder_base" integer NOT NULL,
	"suprimento" integer NOT NULL,
	"recursos" jsonb NOT NULL,
	"postura" text NOT NULL,
	CONSTRAINT "bot_citadels_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"nome" text DEFAULT 'Desconhecido' NOT NULL,
	"tipo" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "milestones_device_tipo_unique" UNIQUE("device_id","tipo")
);
--> statement-breakpoint
CREATE TABLE "primordial_claims" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"tipo" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "primordial_claims_tipo_unique" UNIQUE("tipo")
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth_key" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_notified_at" timestamp with time zone,
	"next_event_at" timestamp with time zone,
	"next_event_text" text,
	"last_notified_event_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscriptions_device_id_unique" UNIQUE("device_id")
);
--> statement-breakpoint
ALTER TABLE "alliances" ADD CONSTRAINT "alliances_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alliances" ADD CONSTRAINT "alliances_ally_id_players_id_fk" FOREIGN KEY ("ally_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchanges" ADD CONSTRAINT "exchanges_from_player_id_players_id_fk" FOREIGN KEY ("from_player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchanges" ADD CONSTRAINT "exchanges_to_player_id_players_id_fk" FOREIGN KEY ("to_player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;