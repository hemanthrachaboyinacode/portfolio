CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `content` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires` integer NOT NULL
);
