import { Test } from "symphoner/dist/models";
import time from "symphoner/dist/time";

export let test:Test = {
	phases: [
		{
			duration: time( 30 ).minutes,
			arrivalRate: time( 10 ).seconds,
			clients: 3,
			scenarios: [
				{
					action: __dirname + "/tests/frontPageRendering.js",
					distribution: 90,
				},
				{
					action: __dirname + "/tests/postAuthoring.js",
					distribution: 10,
				},
			],
		}
	]
};

export * from "./prepare";
