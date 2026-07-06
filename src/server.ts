import app from "./app";
import config from "./config/config";
import { prisma } from "./lib/prisma";

async function main() {
    const port = config.port;

    await prisma.$connect();
    console.log("prisma connected successfully ")

    try {
        app.listen(port,()=>{
            console.log(`server is running in port ${port}`);
        })
    } catch (error) {
        await prisma.$disconnect();
        console.log("initial error",error);
        process.exit(1);
    }
}

main();