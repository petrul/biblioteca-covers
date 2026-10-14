import { startServer, app } from './src/server/index';
import { registerThumbnailRoutes } from './src2/index';

registerThumbnailRoutes(app);
startServer();

export { app, startServer };
