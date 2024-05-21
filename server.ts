import app from "./src/app";
import { config } from "./src/config/config";
import connectDB from "./src/config/db";

const startServer = async () => {
    // Connect database
    try {
        await connectDB();
    } catch (err) {
        console.log(err);
    }

    const port = config.port || 3000;

    app.listen(port, () => {
        console.log(`Listening on port: ${port}`);
    });
};

startServer();
