import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat32 "mo:core/Nat32";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  public type JuiceSize = {
    juice : Text;
    size : Nat;
  };

  module JuiceSize {
    public func compare(js1 : JuiceSize, js2 : JuiceSize) : Order.Order {
      switch (Text.compare(js1.juice, js2.juice)) {
        case (#equal) { Nat.compare(js1.size, js2.size) };
        case (order) { order };
      };
    };

    public func compareByJuice(js1 : JuiceSize, js2 : JuiceSize) : Order.Order {
      Text.compare(js1.juice, js2.juice);
    };

    public func compareBySize(js1 : JuiceSize, js2 : JuiceSize) : Order.Order {
      Nat.compare(js1.size, js2.size);
    };
  };

  public type Transaction = {
    transactionId : Nat;
    teacherPrincipal : ?Principal;
    juice : Text;
    size : Nat;
    price : Nat;
    transactionType : { #teacherFree; #stripePaid };
    timestamp : Time.Time;
    transactionStatus : {
      #success;
      #failure : { reason : Text };
    };
  };

  public type VendingConfig = {
    juiceTypes : [Text];
    sizeOptions : [Nat];
    prices : [(JuiceSize, Nat)];
    vendingUrl : Text;
  };

  public type JuicePrice = {
    juiceSize : JuiceSize;
    price : Nat;
  };

  public type DispenseResult = {
    transaction : Transaction;
    outcome : DispenseOutcome;
  };

  public type DispenseOutcome = {
    #success;
    #error : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let transactions = Map.empty<Nat, Transaction>();
  let freeChancesRemaining = Map.empty<Principal, Nat>();
  let juicePrices = Map.empty<JuiceSize, JuicePrice>();

  var vendingConfig : ?VendingConfig = null;
  var nextTransactionId = 0;
  let freeChancesPerTeacher = 30;

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Stripe configuration - Admin only
  public query func isStripeConfigured() : async Bool {
    switch (stripeConfig) {
      case (null) { false };
      case (?_value) { true };
    };
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  // Teacher free chances - Teacher only
  public query ({ caller }) func getTeacherFreeChances() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check free chances");
    };
    switch (freeChancesRemaining.get(caller)) {
      case (null) { 0 };
      case (?chances) { chances };
    };
  };

  public query ({ caller }) func canTeacherDispenseForFree() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return false;
    };
    switch (freeChancesRemaining.get(caller)) {
      case (?remainingChances) { remainingChances > 0 };
      case (null) { false };
    };
  };

  public query ({ caller }) func isUserEligibleForFreeDispense() : async Bool {
    if (AccessControl.hasPermission(accessControlState, caller, #guest)) {
      return false;
    };
    switch (freeChancesRemaining.get(caller)) {
      case (null) { false };
      case (?remaining) { remaining > 0 };
    };
  };

  // Initialize teacher accounts - Admin only
  public shared ({ caller }) func initializeTeacherAccount(teacherPrincipal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize teacher accounts");
    };
    freeChancesRemaining.add(teacherPrincipal, freeChancesPerTeacher);
  };

  // Pricing - Public read, Admin write
  public func getJuicePrice(juiceSize : JuiceSize) : async Nat {
    switch (juicePrices.get(juiceSize)) {
      case (null) { Runtime.trap("Juice price does not exist") };
      case (?price) { price.price };
    };
  };

  public query func getPrices() : async [JuicePrice] {
    juicePrices.values().toArray();
  };

  public shared ({ caller }) func setPrice(price : JuicePrice) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    juicePrices.add(price.juiceSize, price);
  };

  public shared ({ caller }) func setPrices(prices : [JuicePrice]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    for (price in prices.values()) {
      juicePrices.add(price.juiceSize, price);
    };
  };

  // Vending configuration - Admin only write, public read
  public shared ({ caller }) func updateVendingConfig(config : VendingConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    vendingConfig := ?config;
  };

  public query func getVendingConfig() : async ?VendingConfig {
    vendingConfig;
  };

  // Transaction management
  func generateTransactionId() : Nat {
    let transactionId = nextTransactionId;
    nextTransactionId += 1;
    transactionId;
  };

  // Transaction viewing
  public query ({ caller }) func getTransaction(transactionId : Nat) : async Transaction {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view transactions");
    };

    switch (transactions.get(transactionId)) {
      case (null) {
        Runtime.trap("Transaction with transaction id " # Nat.toText(transactionId) # " does not exist");
      };
      case (?transaction) {
        // Users can only view their own transactions, admins can view all
        switch (transaction.teacherPrincipal) {
          case (?principal) {
            if (principal != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own transactions");
            };
          };
          case (null) {
            // Paid transaction - only admin can view
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own transactions");
            };
          };
        };
        transaction;
      };
    };
  };

  // Admin-only: View transaction range for audit
  public query ({ caller }) func getTransactionRange(start : Nat, end : Nat) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    transactions.entries().filter(
      func((transactionId, _transaction)) {
        transactionId >= start and transactionId <= end;
      }
    ).map(func((_, transaction)) { transaction }).toArray();
  };

  // Admin-only: Get all transactions for a specific teacher
  public query ({ caller }) func getTeacherTransactions(teacherPrincipal : Principal) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    transactions.values().filter(
      func(transaction) {
        switch (transaction.teacherPrincipal) {
          case (?principal) { principal == teacherPrincipal };
          case (null) { false };
        };
      }
    ).toArray();
  };

  // User can view their own transaction history
  public query ({ caller }) func getMyTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their transactions");
    };
    transactions.values().filter(
      func(transaction) {
        switch (transaction.teacherPrincipal) {
          case (?principal) { principal == caller };
          case (null) { false };
        };
      }
    ).toArray();
  };

  // Stripe payment - Authenticated users only
  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?config) {
        await Stripe.getSessionStatus(config, sessionId, transform);
      };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func createCheckoutSession(
    items : [Stripe.ShoppingItem],
    successUrl : Text,
    cancelUrl : Text
  ) : async Text {
    let stripeConfiguration = switch (stripeConfig) {
      case (?config) { config };
      case (null) { Runtime.trap("Stripe needs to be first configured") };
    };
    await Stripe.createCheckoutSession(stripeConfiguration, caller, items, successUrl, cancelUrl, transform);
  };
};
