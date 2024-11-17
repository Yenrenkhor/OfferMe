#![no_std]
#![feature(min_specialization)]

extern crate alloc;
use ink_lang as ink;
use ink::storage::Mapping;

#[ink::contract]
pub mod trade_nft {
    use ink::env::call::FromAccountId;
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;

    /// Struct representing a Trade
    #[derive(Default)]
    #[ink(storage)]
    pub struct TradeNFT {
        trades: Mapping<u128, Trade>,
        trade_counter: u128,
    }

    #[derive(scale::Encode, scale::Decode, Default, Clone, Debug)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct Trade {
        seller: AccountId,
        buyer: AccountId,
        nft_contract: AccountId,
        is_active: bool,
    }

    #[ink(event)]
    pub struct TradeCreated {
        #[ink(topic)]
        trade_id: u128,
        #[ink(topic)]
        seller: AccountId,
        #[ink(topic)]
        nft_contract: AccountId,
    }

    #[ink(event)]
    pub struct TradeApproved {
        #[ink(topic)]
        trade_id: u128,
        #[ink(topic)]
        buyer: AccountId,
    }

    #[ink(event)]
    pub struct TradeRejected {
        #[ink(topic)]
        trade_id: u128,
    }

    impl TradeNFT {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                trades: Mapping::new(),
                trade_counter: 0,
            }
        }

        /// Create a new trade
        #[ink(message)]
        pub fn create_trade(&mut self, nft_contract: AccountId, buyer: AccountId) {
            let trade_id = self.trade_counter;
            let seller = self.env().caller();
            let trade = Trade {
                seller,
                buyer,
                nft_contract,
                is_active: true,
            };

            self.trades.insert(&trade_id, &trade);
            self.env().emit_event(TradeCreated {
                trade_id,
                seller,
                nft_contract,
            });

            self.trade_counter += 1;
        }

        /// Approve a trade and transfer the NFT to the buyer
        #[ink(message)]
        pub fn approve_trade(&mut self, trade_id: u128, token_id: u128) {
            let trade = self.trades.get(&trade_id).expect("Trade does not exist");
            assert!(trade.is_active, "Trade is not active");
            assert_eq!(self.env().caller(), trade.seller, "Only the seller can approve the trade");

            let nft_contract = trade.nft_contract;
            let buyer = trade.buyer;
            ink::env::call::build_call::<ink::env::DefaultEnvironment>()
                .call(nft_contract)
                .exec_input(
                    ink::env::call::ExecutionInput::new(
                        ink::env::call::Selector::new([0x23, 0xb8, 0x72, 0xdd]), // ERC721 transferFrom selector
                    )
                    .push_arg(self.env().account_id())
                    .push_arg(buyer)
                    .push_arg(token_id),
                )
                .returns::<()>()
                .fire()
                .expect("Transfer failed");

            let mut trade = trade;
            trade.is_active = false;
            self.trades.insert(&trade_id, &trade);

            self.env().emit_event(TradeApproved {
                trade_id,
                buyer,
            });
        }

        /// Reject a trade and return the NFT to the seller
        #[ink(message)]
        pub fn reject_trade(&mut self, trade_id: u128, token_id: u128) {
            let trade = self.trades.get(&trade_id).expect("Trade does not exist");
            assert!(trade.is_active, "Trade is not active");
            assert_eq!(self.env().caller(), trade.seller, "Only the seller can reject the trade");

            let nft_contract = trade.nft_contract;
            let seller = trade.seller;
            ink::env::call::build_call::<ink::env::DefaultEnvironment>()
                .call(nft_contract)
                .exec_input(
                    ink::env::call::ExecutionInput::new(
                        ink::env::call::Selector::new([0x23, 0xb8, 0x72, 0xdd]), // ERC721 transferFrom selector
                    )
                    .push_arg(self.env().account_id())
                    .push_arg(seller)
                    .push_arg(token_id),
                )
                .returns::<()>()
                .fire()
                .expect("Transfer failed");

            let mut trade = trade;
            trade.is_active = false;
            self.trades.insert(&trade_id, &trade);

            self.env().emit_event(TradeRejected {
                trade_id,
            });
        }
    }
}