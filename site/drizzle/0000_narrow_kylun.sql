CREATE TABLE `consultations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`priority` text NOT NULL,
	`approach` text NOT NULL,
	`consent_version` text NOT NULL,
	`created_at` integer NOT NULL
);
