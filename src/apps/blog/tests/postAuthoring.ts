import { ActionConfiguration } from "symphoner/dist/actions";
import { Class as Carbon } from "carbonldp";
import * as HTTP from "carbonldp/HTTP";
import { v4 as uuid } from "uuid";
import * as Faker from "faker";

import { bootstrapCarbon, getRandomUserID } from "../common";
import { Post, PostP } from "../models";

module.exports = async function( configuration:ActionConfiguration ) {
	const carbon:Carbon = bootstrapCarbon( configuration.settings.carbonldp );

	const [ post, response ]:[ PostP, HTTP.Response.Class ] = await carbon.documents.createChild<Post>( Post.ENDPOINT, {
		author: <any>{ id: getRandomUserID( carbon ) },
		title: Faker.lorem.sentence(),
		content: Faker.lorem.paragraphs( Faker.random.number( { min: 3, max: 20 } ) ),
		createdOn: new Date(),
		publishedOn: new Date(),
	}, uuid() );

	await post.createAccessPoint( {
		hasMemberRelation: "comment",
		isMemberOfRelation: "post",
	}, Post.ACCESS_POINTS.COMMENTS );

	await post.createAccessPoint( {
		hasMemberRelation: "like",
		isMemberOfRelation: "target"
	} );
};