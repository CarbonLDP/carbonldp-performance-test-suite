import {CarbonLDP} from "carbonldp";
import {Errors} from "carbonldp/HTTP";
import {AccessPoint} from "carbonldp/AccessPoint";
import * as Faker from "faker";
import * as status from "node-status";
import {Item} from "node-status";
import {bootstrapCarbon, getRandomUserID, getSlug} from "./common";
import {Comment, CommentP, Like, Post, PostP, User} from "./models";
import {PrepareArgs} from "../../index";

const console: Console = status.console();
const commentProbability: number = 90;
const likeProbability: number = 95;

let carbonldp: CarbonLDP;
let configuration: PrepareArgs;

async function createUsersEndpoint(): Promise<string> {
    try {
        await carbonldp.documents.$create("/", {}, User.ENDPOINT);
    } catch (error) {
        if (isConflictError(error)) {
            return "Users endpoint already existed";
        } else throw error;
    }

    return "Users endpoint created";
}

async function createPostsEndpoint(): Promise<string> {
    try {
        await carbonldp.documents.$create("/", {}, Post.ENDPOINT);
    } catch (error) {
        if (isConflictError(error)) {
            return "Posts endpoint already existed";
        } else throw error;
    }
    return "Posts endpoint created";
}

async function createDummyUsers(): Promise<string> {
    const users: number = 5;

    const usersItem: Item = status.addItem("users", {
        max: users,
        count: 0,
    });
    status.setPattern("{spinner.dots.magenta} {uptime} | {users.bar} {users.percentage} - {general.custom} {users.default}");
    let alreadyExistingUsers: number = 0;

    for (let i = 1; i <= users; i++) {
        const user: User = {
            types: ["User"],
            name: Faker.name.findName(),
            profilePicture: Faker.image.avatar(),
        };

        const slug: string = getSlug(i);

        try {
            await carbonldp.documents.$create(`${User.ENDPOINT}`, user, slug);
        } catch (error) {
            if (!isConflictError(error)) throw error;
            alreadyExistingUsers++;
        }
        usersItem.inc();
    }

    status.removeItem("users");

    return `Dummy users created. Created: ${users - alreadyExistingUsers} Existing: ${alreadyExistingUsers}`;
}

async function createDummyPosts(): Promise<string> {
    const posts: number = 10;

    const postsItem: Item = status.addItem("posts", {
        max: posts,
        count: 0,
    });
    status.setPattern("{spinner.dots.magenta} {uptime} | {posts.bar} {posts.percentage} - {general.custom} {posts.default}");
    let alreadyExistingPosts: number = 0;

    let i: number = 1;
    const promises: Promise<void>[] = Array
        .apply(null, Array(configuration.concurrency))
        .map(() => (async function () {
            while (i <= posts) {
                const slug: string = getSlug(++i);
                try {
                    await createDummyPost(slug);
                } catch (error) {
                    if (!isConflictError(error)) throw error;
                    alreadyExistingPosts++;
                }
                postsItem.inc();
            }
        })());

    await Promise.all(promises);

    status.removeItem("posts");

    return `Dummy posts created. Created: ${posts - alreadyExistingPosts} Existing: ${alreadyExistingPosts}`;
}

async function createDummyPost(slug: string) {

    let post: PostP = await carbonldp.documents.$create<Post>(`${Post.ENDPOINT}`, {
        types: ["Post"],
        author: <any> {id: getRandomUserID(carbonldp)},
        title: Faker.lorem.sentence(),
        content: Faker.lorem.paragraphs(Faker.random.number({min: 3, max: 20})),
        createdOn: new Date(),
        publishedOn: new Date(),
    }, slug);

    await post.$create({
        types: [AccessPoint.TYPE],
        hasMemberRelation: "comment",
        isMemberOfRelation: "post",
    }, Post.ACCESS_POINTS.COMMENTS);

    await post.$create({
        types: [AccessPoint.TYPE],
        hasMemberRelation: "like",
        isMemberOfRelation: "target"
    }, Post.ACCESS_POINTS.LIKES);

    await createDummyComments(post);
    await createDummyLikes(post);
}

async function createDummyComments(post: PostP) {
    // const comments: number = Faker.random.number({min: 0, max: 20});
    const comments: number = 5;
    for (let i: number = 0; i < comments; i++) {
        await createDummyComment(post);
    }
}

async function createDummyComment(post: PostP) {
    let comment: CommentP = await carbonldp.documents.$create<Comment>(`${post.$id}${Post.ACCESS_POINTS.COMMENTS}`, {
        types: ["Comment"],
        author: <any>{id: getRandomUserID(carbonldp)},
        content: Faker.lorem.paragraph(Faker.random.number({min: 1, max: 10})),
        createdOn: new Date(),
    });

    await comment.$create({
        hasMemberRelation: "like",
        isMemberOfRelation: "target"
    }, Post.ACCESS_POINTS.LIKES);

    let probability: number;
    do {
        if (typeof probability !== "undefined") await createDummyResponse(post, comment);

        probability = Faker.random.number({min: 1, max: 100});
    } while (probability > commentProbability);

    await createDummyLikes(comment);
}

async function createDummyResponse(post: PostP, comment: CommentP) {
    let response: CommentP = await carbonldp.documents.$create<Comment>(`${post.$id}${Post.ACCESS_POINTS.COMMENTS}`, {
        types: ["Comment"],
        author: <any>{id: getRandomUserID(carbonldp)},
        content: Faker.lorem.paragraph(Faker.random.number({min: 1, max: 10})),
        createdOn: new Date(),

        parent: comment,
    });

    await response.$create({
        hasMemberRelation: "like",
        isMemberOfRelation: "target"
    }, Post.ACCESS_POINTS.LIKES);

    let probability: number;
    do {
        if (typeof probability !== "undefined") await createDummyResponse(post, response);

        probability = Faker.random.number({min: 1, max: 100});
    } while (probability > commentProbability);

    await createDummyLikes(response);
}

async function createDummyLikes(target: { $id: string }): Promise<void> {
    let users: string[] = [];

    let probability: number;
    do {
        if (typeof probability !== "undefined") await createDummyLike(target, users);

        probability = Faker.random.number({min: 1, max: 100});
    } while (probability > likeProbability);
}

async function createDummyLike(target: { $id: string }, users: string[]): Promise<void> {
    let userID: string;
    do {
        userID = getRandomUserID(carbonldp);
    } while (users.indexOf(userID) !== -1);

    await carbonldp.documents.$create<Like>(`${target.$id}${Post.ACCESS_POINTS.LIKES}`, {
        types: ["Like"],
        target: <any>target,
        author: <any>{id: userID},
        createdOn: new Date(),
    });

    users.push(userID);
}

function isConflictError(error): boolean {
    return "statusCode" in error && error.statusCode === Errors.ConflictError.statusCode && error.errors[0].errorCode === "0x8901";
}

async function runActions(actions: { title: string, fn: (() => Promise<string>) | (() => string) }[]) {
    status.start({
        pattern: "{spinner.dots.magenta} {uptime} - {general.custom}",
        interval: 100,
    });

    const generalStatusItem: Item = status.addItem("general", {
        steps: actions.map(action => action.title),
        custom: function () {
            return this.steps[this.count];
        }
    });

    for (let action of actions) {
        const result: Promise<string> | string = action.fn();
        const message: string = "then" in (result as object) ? await (result as Promise<string>) : result as string;

        status.setPattern("{spinner.dots.magenta} {uptime} - {general.custom}");

        generalStatusItem.doneStep(true, message);
    }

    status.stop();
}

export async function prepare(args: PrepareArgs) {
    carbonldp = bootstrapCarbon(args.carbonldp);
    configuration = args;

    await runActions([
        {
            title: "Creating users endpoint",
            fn: createUsersEndpoint,
        },
        {
            title: "Creating posts endpoint",
            fn: createPostsEndpoint,
        },
        {
            title: "Creating dummy users",
            fn: createDummyUsers,
        },
        {
            title: "Creating dummy posts",
            fn: createDummyPosts,
        },
    ]);
}
