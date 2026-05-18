// Backwards-compat shim (keep imports stable if referenced elsewhere).
export { connectDb as connectMongo, disconnectDb as disconnectMongo } from '../config/db.js'
