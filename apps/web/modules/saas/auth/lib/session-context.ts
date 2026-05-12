import type { Session } from "@repo/auth";
import React from "react";

export const SessionContext = React.createContext<
	| {
			session: Session["session"];
			user: Session["user"];
			organization: Session["activeOrganizationId"];
			loaded: boolean;
			reloadSession: () => Promise<void>;
	  }
	| undefined
>(undefined);
