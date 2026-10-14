import { startServer, app } from './src/server/index';
import { registerThumbnailRoutes } from './src2/index';
import { registerCoverRenderRoutes } from './src2/cover/routes';

registerThumbnailRoutes(app);
registerCoverRenderRoutes(app);
startServer();

export { app, startServer };
