import { Post } from "./post";

export let User = {
	TYPE: "User",
	SCHEMA: {
		"name": {
			"@id": "name",
			"@type": "string"
		},
		"profilePicture": {
			"@id": "profilePicture",
			"@type": "string"
		},
		"posts": {
			"@id": "post",
			"@type": "@id",
			"@container": "@set"
		},
		"comments": {
			"@id": "comment",
			"@type": "@id",
			"@container": "@set"
		}
	},
	ENDPOINT: "users/",
};

export interface User {
	name:string;
	profilePicture?:string;
	posts?:Post[];
	comments?:Comment[];

	[key:string]:any;
}