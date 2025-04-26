DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "user_username_unique";--> statement-breakpoint
DROP INDEX "batch_name_unique";--> statement-breakpoint
DROP INDEX "data_slot_room";--> statement-breakpoint
DROP INDEX "date_slot_teacher";--> statement-breakpoint
DROP INDEX "schedule_batch";--> statement-breakpoint
DROP INDEX "schedule_subject";--> statement-breakpoint
DROP INDEX "schedule_teacher";--> statement-breakpoint
DROP INDEX "schedule_room";--> statement-breakpoint
DROP INDEX "schedule_slot";--> statement-breakpoint
DROP INDEX "room_name_unique";--> statement-breakpoint
DROP INDEX "subject_name_unique";--> statement-breakpoint
ALTER TABLE `user` ALTER COLUMN "username" TO "username" text;--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `batch_name_unique` ON `batch` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `data_slot_room` ON `class_schedule` (`date`,`slot_id`,`room_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `date_slot_teacher` ON `class_schedule` (`date`,`slot_id`,`teacher_id`);--> statement-breakpoint
CREATE INDEX `schedule_batch` ON `class_schedule` (`batch_id`);--> statement-breakpoint
CREATE INDEX `schedule_subject` ON `class_schedule` (`subject_id`);--> statement-breakpoint
CREATE INDEX `schedule_teacher` ON `class_schedule` (`teacher_id`);--> statement-breakpoint
CREATE INDEX `schedule_room` ON `class_schedule` (`room_id`);--> statement-breakpoint
CREATE INDEX `schedule_slot` ON `class_schedule` (`slot_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `room_name_unique` ON `room` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `subject_name_unique` ON `subject` (`name`);--> statement-breakpoint
ALTER TABLE `user` ALTER COLUMN "phone" TO "phone" text;--> statement-breakpoint
ALTER TABLE `user` ALTER COLUMN "role" TO "role" text;