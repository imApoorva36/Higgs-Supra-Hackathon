module suprasmartbox::smartbox {
    use supra::object;
    use supra::tx_context::TxContext;
    use supra::table::{Self, Table};
    use supra::transfer;
    use supra::event;

    // Custom event structs
    public struct PackageCreatedEvent has copy, drop {
        package_id: object::ID,
        customer: address,
        metadata: vector<u8>
    }

    public struct FundsReleasedEvent has copy, drop {
        package_id: object::ID,
        amount: u64,
        recipient: address
    }

    public struct State has key {
        id: object::UID,
        active_packages: Table<object::ID, bool>
    }

    public struct Package has key, store {
        id: object::UID,
        metadata: vector<u8>,
        cid: vector<u8>,
        customer: address,
        delivered: bool,
        funds: u64,
        funds_released: bool,
        name: vector<u8>,
        description: vector<u8>
    }

    fun init(ctx: &mut TxContext) {
        transfer::share_object(
            State {
                id: object::new(ctx),
                active_packages: table::new(ctx)
            }
        );
    }

    public fun create_package(
        state: &mut State,
        metadata: vector<u8>,
        cid: vector<u8>,
        customer: address,
        name: vector<u8>,
        description: vector<u8>,
        funds: u64,
        ctx: &mut TxContext
    ) {
        let package = Package {
            id: object::new(ctx),
            metadata,
            cid,
            customer,
            delivered: false,
            funds,
            funds_released: false,
            name,
            description
        };
        
        let package_id = object::id(&package);
        table::add(&mut state.active_packages, package_id, true);
        
        event::emit(PackageCreatedEvent {
            package_id,
            customer,
            metadata
        });
        
        transfer::transfer(package, customer);
    }

    public entry fun mark_as_delivered(
        package: &mut Package,
        state: &mut State
    ) {
        assert!(!package.delivered, 0);
        package.delivered = true;
        table::remove(&mut state.active_packages, object::id(package));
    }

    public entry fun release_funds(
        package: &mut Package,
        state: &mut State
    ) {
        assert!(package.delivered, 0); // Package must be delivered
        assert!(!package.funds_released, 1); // Funds not already released
        
        package.funds_released = true;
        
        event::emit(FundsReleasedEvent {
            package_id: object::id(package),
            amount: package.funds,
            recipient: package.customer
        });
        
        table::remove(&mut state.active_packages, object::id(package));
    }

    #[allow(unused_assignment)]
    public fun get_package_details(package: &Package): (address, vector<u8>, vector<u8>, bool, u64, vector<u8>, vector<u8>) {
        (
            package.customer,
            package.metadata,
            package.cid,
            package.delivered,
            package.funds,
            package.name,
            package.description
        )
    }

    entry fun destroy_state(state: State) {
        let State { id, active_packages } = state;
        object::delete(id);
        table::destroy_empty(active_packages);
    }
}