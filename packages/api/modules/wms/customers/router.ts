import { createCustomer } from "./procedures/create-customer";
import { findCustomer } from "./procedures/find-customer";
import { listCustomers } from "./procedures/list-customers";
import { updateCustomer } from "./procedures/update-customer";

export const customerRouter = {
	create: createCustomer,
	list: listCustomers,
	find: findCustomer,
	update: updateCustomer,
};
