import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.test file for integration tests
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
