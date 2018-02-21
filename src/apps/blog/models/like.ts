import * as Pointer from "carbonldp/Pointer";
import { User } from "./user";

export let Like = {
	TYPE: "Like",
	SCHEMA: {
		"target": {
			"@id": "target",
			"@type": "@id"
		},
		"author": {
			"@id": "author",
			"@type": "@id"
		},
		"createdOn": {
			"@id": "createdOn",
			"@type": "dateTime"
		}
	},
};

export interface Like {
	target:Pointer.Class;
	author:User;
	createdOn:Date;

	[key:string]:any;
}