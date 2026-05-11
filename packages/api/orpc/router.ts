import type { RouterClient } from "@orpc/server";
import { adminRouter } from "../modules/admin/router";
import { aiRouter } from "../modules/ai/router";
import { contactRouter } from "../modules/contact/router";
import { masterDataRouter } from "../modules/master-data/router";
import { newsletterRouter } from "../modules/newsletter/router";
import { organizationsRouter } from "../modules/organizations/router";
import { paymentsRouter } from "../modules/payments/router";
import { uploadsRouter } from "../modules/uploads/router";
import { usersRouter } from "../modules/users/router";
import { workforceRouter } from "../modules/workforce/router";
import { publicProcedure } from "./procedures";

export const router = publicProcedure
	// Prefix for openapi
	.prefix("/api")
	.router({
		admin: adminRouter,
		newsletter: newsletterRouter,
		contact: contactRouter,
		organizations: organizationsRouter,
		uploads: uploadsRouter,
		users: usersRouter,
		payments: paymentsRouter,
		workforce: workforceRouter,
		ai: aiRouter,
		masterData: masterDataRouter,
	});

export type ApiRouterClient = RouterClient<typeof router>;
