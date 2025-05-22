CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`username` text,
	`section_id` text,
	`phone` text,
	`role_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`section_id`) REFERENCES `section`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `class_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` integer NOT NULL,
	`slot_id` integer NOT NULL,
	`section_id` text NOT NULL,
	`teacher_id` text NOT NULL,
	`room_id` text NOT NULL,
	`schedule_id` integer NOT NULL,
	`status` text DEFAULT 'notdelivered' NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`deleted_at` integer,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`slot_id`) REFERENCES `slot`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`section_id`) REFERENCES `section`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`teacher_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`schedule_id`) REFERENCES `class_schedule`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_class_session` ON `class_history` (`date`,`slot_id`,`section_id`);--> statement-breakpoint
CREATE INDEX `classhistory_teacher` ON `class_history` (`teacher_id`);--> statement-breakpoint
CREATE INDEX `classhistory_room` ON `class_history` (`room_id`);--> statement-breakpoint
CREATE INDEX `classhistory_section` ON `class_history` (`section_id`);--> statement-breakpoint
CREATE INDEX `classsession_schedule` ON `class_history` (`schedule_id`);--> statement-breakpoint
CREATE TABLE `class_schedule` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`slot_id` integer NOT NULL,
	`section_id` text NOT NULL,
	`course_id` text NOT NULL,
	`teacher_id` text NOT NULL,
	`room_id` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`deleted_at` integer,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`slot_id`) REFERENCES `slot`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`section_id`) REFERENCES `section`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`teacher_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `data_slot` ON `class_schedule` (`day`,`slot_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `data_slot_room` ON `class_schedule` (`day`,`slot_id`,`room_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `date_slot_teacher` ON `class_schedule` (`day`,`slot_id`,`teacher_id`);--> statement-breakpoint
CREATE INDEX `schedule_section` ON `class_schedule` (`section_id`);--> statement-breakpoint
CREATE INDEX `schedule_course` ON `class_schedule` (`course_id`);--> statement-breakpoint
CREATE INDEX `schedule_teacher` ON `class_schedule` (`teacher_id`);--> statement-breakpoint
CREATE INDEX `schedule_room` ON `class_schedule` (`room_id`);--> statement-breakpoint
CREATE INDEX `schedule_slot` ON `class_schedule` (`slot_id`);--> statement-breakpoint
CREATE INDEX `schedule_day` ON `class_schedule` (`day`);--> statement-breakpoint
CREATE TABLE `course` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`credits` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`deleted_at` integer,
	`updated_by` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `course_code_unique` ON `course` (`code`);--> statement-breakpoint
CREATE TABLE `permission` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`deleted_at` integer,
	`updated_by` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `permission_name_unique` ON `permission` (`name`);--> statement-breakpoint
CREATE TABLE `role` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`deleted_at` integer,
	`updated_by` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `role_name_unique` ON `role` (`name`);--> statement-breakpoint
CREATE TABLE `role_permission` (
	`role_id` text NOT NULL,
	`permission_id` text NOT NULL,
	PRIMARY KEY(`role_id`, `permission_id`),
	FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`permission_id`) REFERENCES `permission`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `user_role` (
	`user_id` text NOT NULL,
	`role_id` text NOT NULL,
	PRIMARY KEY(`user_id`, `role_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `room` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`deleted_at` integer,
	`updated_by` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `room_name_unique` ON `room` (`name`);--> statement-breakpoint
CREATE TABLE `section` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`deleted_at` integer,
	`updated_by` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `section_name_unique` ON `section` (`name`);--> statement-breakpoint
CREATE TABLE `slot` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slot_number` integer,
	`start_time` text DEFAULT '00:00' NOT NULL,
	`end_time` text DEFAULT '00:00' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`deleted_at` integer,
	`updated_by` text,
	`deleted_by` text,
	CONSTRAINT "time_format" CHECK(
    "slot"."start_time" GLOB '[0-2][0-9]:[0-5][0-9]' 
    AND "slot"."end_time" GLOB '[0-2][0-9]:[0-5][0-9]' 
    AND "slot"."start_time" < "slot"."end_time"
  )
);
--> statement-breakpoint
CREATE UNIQUE INDEX `slot_slot_number_unique` ON `slot` (`slot_number`);