// // This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
// import { MongoClient, ServerApiVersion } from "mongodb"

// if (!process.env.MONGODB_URI) {
//   throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
// }

// const uri = process.env.MONGODB_URI
// const options = {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// }

// let client: MongoClient

// if (process.env.NODE_ENV === "development") {
//   // In development mode, use a global variable so that the value
//   // is preserved across module reloads caused by HMR (Hot Module Replacement).
//   const globalWithMongo = global as typeof globalThis & {
//     _mongoClient?: MongoClient
//   }

//   if (!globalWithMongo._mongoClient) {
//     globalWithMongo._mongoClient = new MongoClient(uri, options)
//   }
//   client = globalWithMongo._mongoClient
// } else {
//   // In production mode, it's best to not use a global variable.
//   client = new MongoClient(uri, options)
// }

// // Export a module-scoped MongoClient. By doing this in a
// // separate module, the client can be shared across functions.
// export default client
// Uncomment and if needed for adapters but may cause issues with packages

export interface User {
    _id?: string;
    budget_min?: number;
    budget_max?: number;
    email: string;
    password: string;
    role: string;
    username: string;
    createdAt?: Date;
    notes?: string[];
}

export interface Product {
    _id?: string;
    name?: string;
    category: string;
    description?: string;
    price: number;
    discountPrice?: number;
    link?: string;
    rating?: string;
    vendor?: string;
    specs?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Message {
    _id?: string;
    createdAt?: Date;
    userAuthor?: string | User;
    role?: string;
    content?: string;
}

export interface Chat {
    _id?: string;
    display: string;
    creator: string | User;
    archived?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    messages?: Message[];
    recommendation: Recommendation[];
}

export interface Recommendation {
        _id: string,
        display: string
        createdAt?: Date;
        cpu?: string | Product;
        gpu?: string | Product;
        ram?: string | Product;
        psu?: string | Product;
        motherboard?: string | Product;
        storage?: string | Product;
        accessories?: string[] | Product[];
}