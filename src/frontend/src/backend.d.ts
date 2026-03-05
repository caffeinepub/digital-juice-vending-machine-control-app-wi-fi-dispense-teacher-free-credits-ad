import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface JuiceSize {
    size: bigint;
    juice: string;
}
export interface VendingConfig {
    vendingUrl: string;
    sizeOptions: Array<bigint>;
    juiceTypes: Array<string>;
    prices: Array<[JuiceSize, bigint]>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Transaction {
    transactionType: Variant_teacherFree_stripePaid;
    size: bigint;
    juice: string;
    timestamp: Time;
    teacherPrincipal?: Principal;
    transactionStatus: {
        __kind__: "failure";
        failure: {
            reason: string;
        };
    } | {
        __kind__: "success";
        success: null;
    };
    price: bigint;
    transactionId: bigint;
}
export interface JuicePrice {
    juiceSize: JuiceSize;
    price: bigint;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_teacherFree_stripePaid {
    teacherFree = "teacherFree",
    stripePaid = "stripePaid"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    canTeacherDispenseForFree(): Promise<boolean>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getJuicePrice(juiceSize: JuiceSize): Promise<bigint>;
    getMyTransactions(): Promise<Array<Transaction>>;
    getPrices(): Promise<Array<JuicePrice>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTeacherFreeChances(): Promise<bigint>;
    getTeacherTransactions(teacherPrincipal: Principal): Promise<Array<Transaction>>;
    getTransaction(transactionId: bigint): Promise<Transaction>;
    getTransactionRange(start: bigint, end: bigint): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVendingConfig(): Promise<VendingConfig | null>;
    initializeTeacherAccount(teacherPrincipal: Principal): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    isUserEligibleForFreeDispense(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setPrice(price: JuicePrice): Promise<void>;
    setPrices(prices: Array<JuicePrice>): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateVendingConfig(config: VendingConfig): Promise<void>;
}
