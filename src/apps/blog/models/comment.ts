import * as PersistedDocument from "carbonldp/PersistedDocument";

import { User } from "./user";
import { Post } from "./post";
import { Like } from "./like";

export let Comment = {
	TYPE: "Comment",
	SCHEMA: {
		"author": {
			"@id": "author",
			"@type": "@id"
		},
		"content": {
			"@id": "content",
			"@type": "string"
		},
		"post": {
			"@id": "target",
			"@type": "@id"
		},
		"parent": {
			"@id": "parent",
			"@type": "@id"
		},
		"likes": {
			"@id": "like",
			"@type": "@id",
			"@container": "@set"
		},
		"createdOn": {
			"@id": "createdOn",
			"@type": "dateTime"
		},
		"deleted": {
			"@id": "deleted",
			"@type": "boolean"
		}
	},
	ACCESS_POINTS: {
		LIKES: "likes"
	},
};

export interface Comment {
	author:User;
	content:string;
	post?:Post;
	parent?:Comment;
	likes?:Like[];
	createdOn:Date;
	deleted?:boolean;

	[key:string]:any;
}

export type CommentP = Comment & PersistedDocument.Class;
