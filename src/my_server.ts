import { createServer } from 'node:http';
import { app_api } from './my_app';

export const server_api = createServer(app_api);
export const server_ws = createServer();
