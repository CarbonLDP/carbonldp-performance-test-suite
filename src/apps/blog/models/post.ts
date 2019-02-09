import { User } from "./user";
import { Comment } from "./comment";
import { Like } from "./like";

import { Document } from "carbonldp/Document";

export let Post = {
	TYPE: "Post",
	SCHEMA: {
		"author": {
			"@id": "author",
			"@type": "@id"
		},
		"title": {
			"@id": "title",
			"@type": "string"
		},
		"content": {
			"@id": "content",
			"@type": "string"
		},
		"comments": {
			"@id": "comment",
			"@type": "@id",
			"@container": "@set"
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
		"publishedOn": {
			"@id": "publishedOn",
			"@type": "dateTime"
		},
	},
	ACCESS_POINTS: {
		COMMENTS: "comments/",
		LIKES: "likes/",
	},
	ENDPOINT: "posts/",
};

export interface Resource {

}

export interface Post {
	author?:User;
	title:string;
	content:string;
	comments?:Comment[];
	likes?:Like[];
	createdOn:Date;
	publishedOn?:Date;

	[key:string]:any;
}

function create( post:Post ) {

}

export type PostP = Post & Document;
