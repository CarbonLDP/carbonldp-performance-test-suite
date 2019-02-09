import {ActionConfiguration} from "symphoner/dist/actions";
import {CarbonLDP} from "carbonldp";
import {v4 as uuid} from "uuid";
import * as Faker from "faker";

import {bootstrapCarbon, getRandomUserID} from "../common";
import {Post, PostP} from "../models";
import {AccessPoint} from "carbonldp/AccessPoint";

module.exports = async function (configuration: ActionConfiguration) {
    const carbonldp: CarbonLDP = bootstrapCarbon(configuration.settings.carbonldp);

    const post: PostP = await carbonldp.documents.$create<Post>(Post.ENDPOINT, {
        author: <any>{id: getRandomUserID(carbonldp)},
        title: Faker.lorem.sentence(),
        content: Faker.lorem.paragraphs(Faker.random.number({min: 3, max: 20})),
        createdOn: new Date(),
        publishedOn: new Date(),
    }, uuid());

    await post.$create({
        types: [AccessPoint.TYPE],
        hasMemberRelation: "comment",
        isMemberOfRelation: "post",
    }, Post.ACCESS_POINTS.COMMENTS);

    await post.$create({
        types: [AccessPoint.TYPE],
        hasMemberRelation: "like",
        isMemberOfRelation: "target"
    });
};