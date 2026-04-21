import { createProduct } from "./procedures/create-product";
import { createProductFamily } from "./procedures/create-product-family";
import { createProductModel } from "./procedures/create-product-model";
import { createUom } from "./procedures/create-uom";
import { createVariant } from "./procedures/create-variant";
import { findProduct } from "./procedures/find-product";
import { listProductFamilies } from "./procedures/list-product-families";
import { listProductModels } from "./procedures/list-product-models";
import { listProducts } from "./procedures/list-products";
import { listUoms } from "./procedures/list-uoms";
import { listVariants } from "./procedures/list-variants";
import { updateProduct } from "./procedures/update-product";
import { updateProductFamily } from "./procedures/update-product-family";
import { upsertDispatchRule } from "./procedures/upsert-dispatch-rule";
import { upsertProductAttributes } from "./procedures/upsert-product-attributes";
import { upsertUomConversion } from "./procedures/upsert-uom-conversion";
import { upsertVariantAttributes } from "./procedures/upsert-variant-attributes";

export const productRouter = {
	families: {
		create: createProductFamily,
		list: listProductFamilies,
		update: updateProductFamily,
	},
	models: {
		create: createProductModel,
		list: listProductModels,
	},
	products: {
		create: createProduct,
		list: listProducts,
		find: findProduct,
		update: updateProduct,
	},
	variants: {
		create: createVariant,
		list: listVariants,
	},
	attributes: {
		upsertProduct: upsertProductAttributes,
		upsertVariant: upsertVariantAttributes,
	},
	uom: {
		create: createUom,
		list: listUoms,
		upsertConversion: upsertUomConversion,
	},
	dispatchRules: {
		upsert: upsertDispatchRule,
	},
};
