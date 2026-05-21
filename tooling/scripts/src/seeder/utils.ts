import { nanoid } from "nanoid";

// Prisma cuid() uses 25 chars, nanoid uses 21 by default, but either works as a unique string.
export function generateId(): string {
	// Using nanoid for fast ID generation
	return nanoid();
}

export function generateDateBetween(start: Date, end: Date): Date {
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime()),
	);
}
