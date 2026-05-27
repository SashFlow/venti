import { db } from "../prisma";

export async function listUOMs() {
	return db.unitOfMeasure.findMany({
		orderBy: { code: "asc" },
	});
}

export async function createUOM(data: { code: string; name: string }) {
	return db.unitOfMeasure.create({
		data: {
			code: data.code.trim(),
			name: data.name.trim(),
		},
	});
}

export async function updateUOM(
	id: string,
	data: { code?: string; name?: string },
) {
	return db.unitOfMeasure.update({
		where: { id },
		data: {
			...(data.code ? { code: data.code.trim() } : {}),
			...(data.name ? { name: data.name.trim() } : {}),
		},
	});
}

export async function deleteUOM(id: string) {
	return db.unitOfMeasure.delete({
		where: { id },
	});
}
