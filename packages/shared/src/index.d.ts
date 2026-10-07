export declare enum UserRole {
    OWNER = "OWNER",
    MANAGER = "MANAGER",
    CASHIER = "CASHIER",
    WAITER = "WAITER",
    KITCHEN = "KITCHEN"
}
export declare enum OrderStatus {
    PENDING = "PENDING",
    PREPARING = "PREPARING",
    READY = "READY",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare const DEMO_TENANT_SLUG = "mock-tenant";
export declare const DEMO_ADMIN_EMAIL = "admin@postrestoran.com";
export declare const DEMO_ADMIN_PASSWORD = "admin123";
