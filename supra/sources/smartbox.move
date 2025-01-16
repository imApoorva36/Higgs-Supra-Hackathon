module exampleAddress::smartbox {
    use supra_framework::supra_coin;
    use supra_framework::coin;
    use std::signer;
    use std::account;
    use std::object::{Self, UID};
    use std::tx_context::{Self, TxContext};
    use std::table::{Self, Table};
    use std::transfer;
    use std::event;
    use std::vector;

    // Error constants
    const ERR_NOT_OWNER: u64 = 0;
    const ERR_NOT_AUTHORIZED: u64 = 1;
    const ERR_ALREADY_REGISTERED: u64 = 2;
    const ERR_NOT_DELIVERY_AGENT: u64 = 3;
    const ERR_ORDER_FULFILLED: u64 = 4;
    const ERR_PACKAGE_NOT_DELIVERED: u64 = 5;
    const ERR_FUNDS_ALREADY_RELEASED: u64 = 6;

    // Role definitions
    const ROLE_NONE: u8 = 0;
    const ROLE_CUSTOMER: u8 = 1;
    const ROLE_DELIVERY_AGENT: u8 = 2;

    struct User has store {
        metadata: vector<u8>,
        cid: vector<u8>,
        rfid_data: vector<u8>,
        role: u8
    }

    struct Package has key, store {
        id: UID,
        metadata: vector<u8>,
        cid: vector<u8>,
        customer: address,
        delivered: bool,
        funds: u64,
        funds_released: bool,
        name: vector<u8>,
        description: vector<u8>,
        delivery_agent: address
    }

    struct Order has key, store {
        id: UID,
        metadata: vector<u8>,
        cid: vector<u8>,
        customer: address,
        fulfilled: bool,
        funds: u64,
        name: vector<u8>,
        description: vector<u8>
    }

    struct State has key {
        id: UID,
        owner: address,
        users: Table<address, User>,
        active_packages: Table<object::ID, bool>,
        active_orders: Table<object::ID, bool>,
        next_package_id: u64,
        next_order_id: u64,
        user_addresses: vector<address>
    }

    // Events
    struct UserRegisteredEvent has copy, drop {
        user: address,
        role: u8
    }

    struct OrderCreatedEvent has copy, drop {
        order_id: object::ID,
        customer: address
    }

    struct PackageCreatedEvent has copy, drop {
        package_id: object::ID,
        customer: address,
        metadata: vector<u8>
    }

    struct PackageDeliveredEvent has copy, drop {
        package_id: object::ID,
        delivery_agent: address
    }

    struct FundsReleasedEvent has copy, drop {
        package_id: object::ID,
        amount: u64,
        recipient: address
    }

    fun init(ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        transfer::share_object(
            State {
                id: object::new(ctx),
                owner: sender,
                users: table::new(ctx),
                active_packages: table::new(ctx),
                active_orders: table::new(ctx),
                next_package_id: 0,
                next_order_id: 0,
                user_addresses: vector::empty()
            }
        );
    }

    public entry fun register_user(
        state: &mut State,
        metadata: vector<u8>,
        cid: vector<u8>,
        rfid_data: vector<u8>,
        role: u8,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(!table::contains(&state.users, sender), ERR_ALREADY_REGISTERED);

        table::add(&mut state.users, sender, User {
            metadata,
            cid,
            rfid_data,
            role
        });
        vector::push_back(&mut state.user_addresses, sender);

        event::emit(UserRegisteredEvent { user: sender, role });
    }

    public entry fun create_order(
        state: &mut State,
        metadata: vector<u8>,
        cid: vector<u8>,
        name: vector<u8>,
        description: vector<u8>,
        funds: u64,
        ctx: &mut TxContext
    ) {
        let order = Order {
            id: object::new(ctx),
            metadata,
            cid,
            customer: tx_context::sender(ctx),
            fulfilled: false,
            funds,
            name,
            description
        };

        let order_id = object::id(&order);
        table::add(&mut state.active_orders, order_id, true);
        
        event::emit(OrderCreatedEvent {
            order_id,
            customer: tx_context::sender(ctx)
        });

        state.next_order_id = state.next_order_id + 1;
        transfer::transfer(order, tx_context::sender(ctx));
    }

    public entry fun create_package_from_order(
        state: &mut State,
        order: &mut Order,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let user = table::borrow(&state.users, sender);
        assert!(user.role == ROLE_DELIVERY_AGENT, ERR_NOT_DELIVERY_AGENT);
        assert!(!order.fulfilled, ERR_ORDER_FULFILLED);

        let package = Package {
            id: object::new(ctx),
            metadata: order.metadata,
            cid: order.cid,
            customer: order.customer,
            delivered: false,
            funds: order.funds,
            funds_released: false,
            name: order.name,
            description: order.description,
            delivery_agent: sender
        };

        order.fulfilled = true;
        let package_id = object::id(&package);
        table::add(&mut state.active_packages, package_id, true);
        
        event::emit(PackageCreatedEvent {
            package_id,
            customer: order.customer,
            metadata: order.metadata
        });

        state.next_package_id = state.next_package_id + 1;
        transfer::transfer(package, order.customer);
    }

    public entry fun mark_as_delivered(
        state: &mut State,
        package: &mut Package,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(package.delivery_agent == sender, ERR_NOT_AUTHORIZED);
        assert!(!package.delivered, ERR_PACKAGE_NOT_DELIVERED);

        package.delivered = true;
        table::remove(&mut state.active_packages, object::id(package));

        event::emit(PackageDeliveredEvent {
            package_id: object::id(package),
            delivery_agent: sender
        });
    }

    public entry fun release_funds(
        package: &mut Package,
        ctx: &mut TxContext
    ) {
        assert!(package.delivered, ERR_PACKAGE_NOT_DELIVERED);
        assert!(!package.funds_released, ERR_FUNDS_ALREADY_RELEASED);
        
        package.funds_released = true;
        
        event::emit(FundsReleasedEvent {
            package_id: object::id(package),
            amount: package.funds,
            recipient: package.delivery_agent
        });
    }

    // View functions
    #[view]
    public fun get_package_details(package: &Package): (
        address, vector<u8>, vector<u8>, bool, u64, bool, vector<u8>, vector<u8>, address
    ) {
        (
            package.customer,
            package.metadata,
            package.cid,
            package.delivered,
            package.funds,
            package.funds_released,
            package.name,
            package.description,
            package.delivery_agent
        )
    }

    #[view]
    public fun get_user(state: &State, user_addr: address): (vector<u8>, vector<u8>, vector<u8>, u8) {
        let user = table::borrow(&state.users, user_addr);
        (user.metadata, user.cid, user.rfid_data, user.role)
    }

    #[view]
    public fun get_user_addresses(state: &State): vector<address> {
        state.user_addresses
    }
}
