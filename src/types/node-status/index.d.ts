declare module "node-status" {
	export interface ItemOptions {
		label?:string;
		max?:number;
		count?:number;
		precision?:number;
		steps?:boolean | string[];

		custom?:() => string;
	}

	export interface StartOptions {
		invert?:boolean;
		interval?:number;
		pattern?:string;
		bottom?:boolean;
	}

	export interface Item {
		count:number;

		inc( value:number ):void;

		inc():void;

		dec( value:number ):void;

		dec():void;

		doneStep( success:boolean, message?:string ):void;
	}

	export function addItem( name:string, itemOptions?:ItemOptions ):Item;

	export function removeItem( name:string ):void;

	export function removeAll():void;

	export function start( options?:StartOptions ):void;

	export function setPattern( pattern:string ):void;

	export function clear():void;

	export function stop():void;

	export function console():Console;

	export function cellCount():number;
}