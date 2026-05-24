import type { RouterClient } from "@orpc/server";
import { adminRouter } from "../modules/admin/router";
import { aiRouter } from "../modules/ai/router";
import { contactRouter } from "../modules/contact/router";
import { customersRouter } from "../modules/customers/router";
import { inboundRouter } from "../modules/inbound/router";
import { inventoryRouter } from "../modules/inventory/router";
import { masterDataRouter } from "../modules/master-data/router";
import { newsletterRouter } from "../modules/newsletter/router";
import { ordersRouter } from "../modules/orders/router";
import { organizationsRouter } from "../modules/organizations/router";
import { paymentsRouter } from "../modules/payments/router";
import { productsRouter } from "../modules/products/router";
import { returnsRouter } from "../modules/returns/router";
import { tasksRouter } from "../modules/tasks/router";
import { uploadsRouter } from "../modules/uploads/router";
import { usersRouter } from "../modules/users/router";
import { warehouseRouter } from "../modules/warehouse/router";
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
		orders: ordersRouter,
		uploads: uploadsRouter,
		users: usersRouter,
		payments: paymentsRouter,
		workforce: workforceRouter,
		warehouse: warehouseRouter,
		ai: aiRouter,
		customers: customersRouter,

		products: productsRouter,
		masterData: masterDataRouter,
		inventory: inventoryRouter,
		inbound: inboundRouter,
		returns: returnsRouter,
		tasks: tasksRouter,
	});

export type ApiRouterClient = RouterClient<typeof router>;
