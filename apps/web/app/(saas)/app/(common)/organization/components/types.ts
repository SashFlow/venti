export type Option = {
	value: string;
	label: string;
};

export type MetafieldSchema = {
	id: string;
	name: string;
	namespace: string;
	type: string;
	required: boolean;
};

export type OrganizationToggleState = Record<string, boolean>;
