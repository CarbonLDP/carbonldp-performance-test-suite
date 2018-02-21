import { Class as Carbon } from "carbonldp";
import { ActionConfiguration } from "symphoner/dist/actions";
import { Post, User } from "../models";
import { bootstrapCarbon } from "../common";

module.exports = async function( configuration:ActionConfiguration ) {
	const carbon:Carbon = bootstrapCarbon( configuration.settings.carbonldp );

	await carbon.documents.getMembers( Post.ENDPOINT, _ => _
		.withType( Post.TYPE )
		.properties( {
			"author": {
				"query": _ => _
					.withType( User.TYPE )
					.properties( {
						"name": _.inherit,
						"profilePicture": _.inherit,
					} )
			},
			"title": _.inherit,
			"comments": _.inherit,
			"likes": _.inherit,
			"publishedOn": _.inherit,
			"deleted": _.inherit,
		} )
		.filter( `${_.property( "publishedOn" )} < ${_.value( new Date() )} && ( ${_.property( "deleted" )} != ${_.value( true )} )` )
		.orderBy( "publishedOn", "descending" )
		.limit( 30 )
	);
};