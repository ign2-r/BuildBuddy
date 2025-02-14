export interface Chats {
    id: string;
    archived: boolean;
    display: string;
    messages: string[];
}

export interface Messages {
    id: string;
    author: string;
    message: string;
    timestamp: Date;
}

export interface Product {
    id: string;
    category: string;
    description: string;
    discountPrice: number;
    link: string;
    name: string;
    price: number;
    rating: string;
    specs: string[];
    vendor: string;
}

export interface User {
    id: string;
    budget_max: number;
    budget_min: number;
    email: string;
    password: string;
    role: string;
    username: string;
}