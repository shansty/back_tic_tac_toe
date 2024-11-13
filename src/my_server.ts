import { createServer } from 'node:http';
import app from './my_app';

export const server = createServer(app);

export default server
