module exampleAddress::smartbox {
    use aptos_std::signer::address_of;
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
        id: u64,
        metadata: vector<u8>,
        cid: vector<u8>,
        rfid_data: vector<u8>,
        role: u8
    }

    struct Package has key, store, drop {
        id: u64,
        package_id: u64,
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
        id: u64,
        order_id: u64,
        metadata: vector<u8>,
        cid: vector<u8>,
        customer: address,
        fulfilled: bool,
        funds: u64,
        name: vector<u8>,
        description: vector<u8>
    }

    struct State has key, store {
        id: u64,
        owner: address,
        users: vector<User>,
        active_packages: vector<Package>,
        active_orders: vector<Order>,
        next_package_id: u64,
        next_order_id: u64,
        user_addresses: vector<address>
    }

    // Helper functions to generate new IDs
    fun next_order_id(state: &State): u64 {
        state.next_order_id
    }

    fun next_package_id(state: &State): u64 {
        state.next_package_id
    }

    // Events
    struct UserRegisteredEvent has copy, drop, store {
        user: address,
        role: u8
    }

    struct OrderCreatedEvent has copy, drop, store {
        order_id: u64,
        customer: address
    }

    struct PackageCreatedEvent has copy, drop, store {
        package_id: u64,
        customer: address,
        metadata: vector<u8>
    }

    struct PackageDeliveredEvent has copy, drop, store {
        package_id: u64,
        delivery_agent: address
    }

    struct FundsReleasedEvent has copy, drop, store {
        package_id: u64,
        amount: u64,
        recipient: address
    }

    public entry fun init(account: &signer) {
        let sender = address_of(account);
        let state = State {
            id: 0,
            owner: sender,
            users: vector::empty(),
            active_packages: vector::empty(),
            active_orders: vector::empty(),
            next_package_id: 0,
            next_order_id: 0,
            user_addresses: vector::empty()
        };
        move_to<State>(account, state);
    }

    public entry fun register_user(
        account: &signer,
        metadata: vector<u8>,
        cid: vector<u8>,
        rfid_data: vector<u8>,
        role: u8
    ) acquires State {
        let sender = address_of(account);
        let state = borrow_global_mut<State>(sender);
        assert!(!vector::contains(&state.user_addresses, &sender), ERR_ALREADY_REGISTERED);

        vector::push_back(&mut state.users, User {
            id: 0,
            metadata,
            cid,
            rfid_data,
            role
        });
        vector::push_back(&mut state.user_addresses, sender);
    }

    public entry fun create_order(
        account: &signer,
        metadata: vector<u8>,
        cid: vector<u8>,
        name: vector<u8>,
        description: vector<u8>,
        funds: u64
    ) acquires State {
        let sender = address_of(account);
        let state = borrow_global_mut<State>(sender);
        let order_id = next_order_id(state);
        
        let order = Order {
            id: 0,
            order_id,
            metadata,
            cid,
            customer: sender,
            fulfilled: false,
            funds,
            name,
            description
        };

        vector::push_back(&mut state.active_orders, order);
        state.next_order_id = state.next_order_id + 1;
    }

    public entry fun create_package_from_order(
        account: &signer,
        order_id: u64
    ) acquires State {
        let sender = address_of(account);
        let state = borrow_global_mut<State>(sender);
        let package_id = next_package_id(state);

        // Find user's role
        let user_idx = find_user_index(&state.user_addresses, sender);
        let user = vector::borrow(&state.users, user_idx);
        assert!(user.role == ROLE_DELIVERY_AGENT, ERR_NOT_DELIVERY_AGENT);

        // Find order
        let order_idx = find_order_index(&state.active_orders, order_id);
        let order = vector::borrow_mut(&mut state.active_orders, order_idx);
        assert!(!order.fulfilled, ERR_ORDER_FULFILLED);

        let package = Package {
            id: 0,
            package_id,
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
        vector::push_back(&mut state.active_packages, package);
        state.next_package_id = state.next_package_id + 1;
    }

    public entry fun mark_as_delivered(
        account: &signer,
        package_id: u64
    ) acquires State, Package {
        let sender = address_of(account);
        let state = borrow_global_mut<State>(sender);
        let package = borrow_global_mut<Package>(sender);

        assert!(package.delivery_agent == sender, ERR_NOT_AUTHORIZED);
        assert!(!package.delivered, ERR_PACKAGE_NOT_DELIVERED);

        package.delivered = true;
        vector::remove(&mut state.active_packages, package_id);
    }

    public entry fun release_funds(
        account: &signer,
        _package_id: u64  // Prefix with underscore since unused
    ) acquires State, Package {
        let sender = address_of(account);
        let _state = borrow_global_mut<State>(sender);
        let package = borrow_global_mut<Package>(sender);
        assert!(package.delivered, ERR_PACKAGE_NOT_DELIVERED);
        assert!(!package.funds_released, ERR_FUNDS_ALREADY_RELEASED);

        package.funds_released = true;
    }

    // Helper function to find user index
    fun find_user_index(addresses: &vector<address>, target: address): u64 {
        let i = 0;
        let len = vector::length(addresses);
        while (i < len) {
            if (*vector::borrow(addresses, i) == target) {
                return i
            };
            i = i + 1;
        };
        abort ERR_NOT_AUTHORIZED
    }

    // Helper function to find order index
    fun find_order_index(orders: &vector<Order>, target_id: u64): u64 {
        let i = 0;
        let len = vector::length(orders);
        while (i < len) {
            if (vector::borrow(orders, i).order_id == target_id) {
                return i
            };
            i = i + 1;
        };
        abort ERR_NOT_AUTHORIZED
    }

    // Helper function to find package by id
    fun find_package_index(packages: &vector<Package>, target_id: u64): u64 {
        let i = 0;
        let len = vector::length(packages);
        while (i < len) {
            if (vector::borrow(packages, i).package_id == target_id) {
                return i
            };
            i = i + 1;
        };
        abort ERR_NOT_AUTHORIZED
    }

    // Helper function to find user by address
    fun find_user_by_address(state: &State, target_addr: address): u64 {
        let i = 0;
        let len = vector::length(&state.user_addresses);
        while (i < len) {
            if (*vector::borrow(&state.user_addresses, i) == target_addr) {
                return i
            };
            i = i + 1;
        };
        abort ERR_NOT_AUTHORIZED
    }

    // View functions
    #[view]
    public fun get_package_details(package_id: u64): (
        address, vector<u8>, vector<u8>, bool, u64, bool, vector<u8>, vector<u8>, address
    ) acquires State {
        let state = borrow_global<State>(@0xa8ec96f327c18b20a4a20ac0f25725527e4686385710aa8a74df7cd75fc3e1e6);
        let package_idx = find_package_index(&state.active_packages, package_id);
        let package = vector::borrow(&state.active_packages, package_idx);
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
    public fun get_user(user_addr: address): (vector<u8>, vector<u8>, vector<u8>, u8) acquires State {
        let state = borrow_global<State>(@0xa8ec96f327c18b20a4a20ac0f25725527e4686385710aa8a74df7cd75fc3e1e6);
        let user_idx = find_user_by_address(state, user_addr);
        let user = vector::borrow(&state.users, user_idx);
        (user.metadata, user.cid, user.rfid_data, user.role)
    }

    #[view]
    public fun get_user_addresses(): vector<address> acquires State {
        let state = borrow_global<State>(@0xa8ec96f327c18b20a4a20ac0f25725527e4686385710aa8a74df7cd75fc3e1e6);
        state.user_addresses
    }
}