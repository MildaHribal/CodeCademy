CREATE TABLE `uzivatele` (
	`id` text PRIMARY KEY NOT NULL,
	`jmeno` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'uzivatel' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uzivatele_email_unique` ON `uzivatele` (`email`);--> statement-breakpoint
CREATE TABLE `inzeraty` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`nazev` text NOT NULL,
	`popis` text DEFAULT '' NOT NULL,
	`cena` integer NOT NULL,
	`kategorie` text NOT NULL,
	`stav` text DEFAULT 'aktivni' NOT NULL,
	`autor_id` text NOT NULL,
	`vytvoreno` integer NOT NULL,
	FOREIGN KEY (`autor_id`) REFERENCES `uzivatele`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inzeraty_slug_unique` ON `inzeraty` (`slug`);
