#![no_std]
#![feature(min_specialization)]

extern crate alloc;
use ink_lang as ink;
use ink::storage::Mapping;

#[ink::contract]
pub mod vault {
    use ink::storage::Mapping;
    use ink::env::call::FromAccountId;

    #[ink(storage)]
    pub struct Vault {
        transactions: Mapping<u128, Transaction>,
        transaction_count: u128,
    }

    #[derive(Default)]
    pub struct Transaction {
        buyer: Option<AccountId>,
        seller: Option<AccountId>,
        approver: Option<AccountId>,
        eth_balance: Balance,
        erc20_balances: Mapping<AccountId, Balance>,
        deposited_tokens: Vec<AccountId>,
        deposit_timestamp: u64,
        is_locked: bool,
        is_approved: bool,
    }

    #[ink(event)]
    pub struct RolesAssigned {
        #[ink(topic)]
        transaction_id: u128,
        #[ink(topic)]
        buyer: AccountId,
        #[ink(topic)]
        seller: AccountId,
        approver: AccountId,
    }

    #[ink(event)]
    pub struct Deposited {
        #[ink(topic)]
        transaction_id: u128,
        #[ink(topic)]
        token: Option<AccountId>,
        #[ink(topic)]
        from: AccountId,
        amount: Balance,
    }

    #[ink(event)]
    pub struct Approved {
        #[ink(topic)]
        transaction_id: u128,
    }

    #[ink(event)]
    pub struct Rejected {
        #[ink(topic)]
        transaction_id: u128,
    }

    #[ink(event)]
    pub struct Cancelled {
        #[ink(topic)]
        transaction_id: u128,
    }

    #[ink(event)]
    pub struct FundsTransferred {
        #[ink(topic)]
        transaction_id: u128,
        #[ink(topic)]
        to: AccountId,
        amount: Balance,
    }

    #[ink(event)]
    pub struct TokensTransferred {
        #[ink(topic)]
        transaction_id: u128,
        #[ink(topic)]
        token: AccountId,
        #[ink(topic)]
        to: AccountId,
        amount: Balance,
    }

    impl Vault {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                transactions: Mapping::new(),
                transaction_count: 0,
            }
        }

        #[ink(message)]
        pub fn create_transaction(
            &mut self,
            seller: AccountId,
            approver: AccountId,
        ) -> u128 {
            let transaction_id = self.transaction_count + 1;
            self.transaction_count = transaction_id;

            let txn = Transaction {
                buyer: Some(self.env().caller()),
                seller: Some(seller),
                approver: Some(approver),
                is_locked: false,
                is_approved: false,
                ..Default::default()
            };

            self.transactions.insert(transaction_id, &txn);
            self.env().emit_event(RolesAssigned {
                transaction_id,
                buyer: self.env().caller(),
                seller,
                approver,
            });

            transaction_id
        }

        #[ink(message, payable)]
        pub fn deposit_eth(&mut self, transaction_id: u128) {
            let caller = self.env().caller();
            let mut txn = self.transactions.get(transaction_id).expect("Txn not found");
            assert!(txn.buyer == Some(caller), "Not the buyer");
            assert!(!txn.is_locked, "Vault is locked");

            let amount = self.env().transferred_balance();
            assert!(amount > 0, "No ETH sent");

            txn.eth_balance += amount;
            txn.is_locked = true;
            txn.deposit_timestamp = self.env().block_timestamp();

            self.transactions.insert(transaction_id, &txn);

            self.env().emit_event(Deposited {
                transaction_id,
                token: None,
                from: caller,
                amount,
            });
        }

        #[ink(message)]
        pub fn approve(&mut self, transaction_id: u128) {
            let caller = self.env().caller();
            let mut txn = self.transactions.get(transaction_id).expect("Txn not found");
            assert!(txn.approver == Some(caller), "Not the approver");
            assert!(txn.is_locked, "No funds deposited");
            assert!(
                self.env().block_timestamp() <= txn.deposit_timestamp + 86400,
                "Deal expired"
            );

            txn.is_approved = true;
            self.transactions.insert(transaction_id, &txn);
            self.env().emit_event(Approved { transaction_id });

            self.transfer_funds(transaction_id);
        }

        fn transfer_funds(&mut self, transaction_id: u128) {
            let mut txn = self.transactions.get(transaction_id).expect("Txn not found");

            if txn.eth_balance > 0 {
                let amount = txn.eth_balance;
                txn.eth_balance = 0;

                self.env()
                    .transfer(txn.seller.expect("Seller not set"), amount)
                    .expect("Transfer failed");
                self.env().emit_event(FundsTransferred {
                    transaction_id,
                    to: txn.seller.expect("Seller not set"),
                    amount,
                });
            }

            txn.is_locked = false;
            self.transactions.insert(transaction_id, &txn);
        }
    }
}