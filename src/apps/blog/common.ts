import { Comment, Like, Post, User } from "./models";
import * as Carbon from "carbonldp";
import { CarbonLDPConfiguration } from "../../index";
import * as Faker from "faker";

export function bootstrapCarbon( configuration:CarbonLDPConfiguration ):Carbon.Class {
	const carbon:Carbon.Class = new Carbon.Class( `${configuration.host}:${configuration.port}`, ! ! configuration.ssl );

	carbon.extendObjectSchema( Comment.TYPE, Comment.SCHEMA );
	carbon.extendObjectSchema( Like.TYPE, Like.SCHEMA );
	carbon.extendObjectSchema( Post.TYPE, Post.SCHEMA );
	carbon.extendObjectSchema( User.TYPE, User.SCHEMA );

	return carbon;
}

export function pad( number:number, width:number, paddingCharacter:string = "0" ):string {
	const stringNumber = number + '';
	return stringNumber.length >= width ? stringNumber : new Array( width - stringNumber.length + 1 ).join( paddingCharacter ) + stringNumber;
}

export function getRandomUserID( carbon:Carbon.Class ):string {
	let authorSlug:string = pad( Faker.random.number( { min: 1, max: 100 } ), 9 );
	return carbon.resolve( `${User.ENDPOINT}/${authorSlug}/` );
}

export function getSlug( index:number ):string {
	let slug:string = pad( index, 9 );
	return slug
		.replace( /0/g, "a" )
		.replace( /1/g, "b" )
		.replace( /2/g, "c" )
		.replace( /3/g, "d" )
		.replace( /4/g, "e" )
		.replace( /5/g, "f" )
		.replace( /6/g, "g" )
		.replace( /7/g, "h" )
		.replace( /8/g, "i" )
		.replace( /9/g, "j" );
}
