import { Symphoner } from "symphoner";
import * as yargs from "yargs";
import { Test } from "symphoner/dist/models";

export interface CarbonLDPConfiguration {
	ssl:boolean;
	host:string;
	port:number;
}

export interface Args {
	config?:string;
	carbonldp:CarbonLDPConfiguration;
}

export interface PrepareArgs extends Args {
	app:string;
	concurrency:number;
}

export interface RunArgs extends Args {
	app:string;
	statsd:{
		host:string;
		port:number;
	};
}

yargs
	.command( "prepare <app>", "Prepare applications' data for testing",
		yargs => yargs
			.describe( "concurrency", "Concurrent requests to send (when possible)" )
			.default( "concurrency", 1 )
		, async<void>( prepare ) )
	.command( "run <app>", "Run tests associated with the specified app",
		yargs => yargs
			.describe( "statsd.host", "Host of statsd" )
			.requiresArg( "statsd.host" )

			.describe( "statsd.port", "Port of statsd" )
			.requiresArg( "statsd.port" )
		, async<void>( run ) )

	.describe( "config", "Configuration file to load configuration from" )

	.describe( "carbonldp.ssl", "Flag to use SSL or not" )
	.default( "carbonldp.ssl", false )

	.describe( "carbonldp.host", "Host of the CarbonLDP service to test" )
	.requiresArg( "carbonldp.host" )

	.describe( "carbonldp.port", "Port of the CarbonLDP service to test" )
	.requiresArg( "carbonldp.port" )
	.help()
	.argv;

interface App {
	test:Test;
	prepare:( configuration:PrepareArgs ) => Promise<void>;
}

function async<R>( fn:( ...args ) => Promise<R> ):( ...args ) => Promise<void> {
	return function( ...args ) {
		return fn( ...args ).then( () => void 0 ).catch( console.error );
	};
}

async function prepare( args:PrepareArgs ) {
	args = args.config ? Object.assign( args, require( args.config ) ) : args;

	const app:App = require( `${__dirname}/apps/${args.app}` );
	await app.prepare( args );
}

async function run( args:RunArgs ) {
	args = args.config ? Object.assign( args, require( args.config ) ) : args;

	const app:App = require( `${__dirname}/apps/${args.app}` );

	const symphoner:Symphoner = new Symphoner( {
		statsd: {
			host: args.statsd.host,
			port: args.statsd.port,
			prefix: "carbonldp."
		},
		settings: args,
	} );

	symphoner
		.run( app.test )
		.then( () => {
			process.exit( 0 );
		} )
		.catch( console.error );
}
