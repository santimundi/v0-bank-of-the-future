-- Seed transactions for the past 3 months
-- Fixed all account_id references to match actual account IDs in database

INSERT INTO transactions (id, account_id, type, amount, balance_after, description, merchant, category, status, reference, date) VALUES
-- Sarah Chen's transactions (Current Account)
('aaaa0001-0001-0001-0001-000000000001', 'aaaa1111-1111-1111-1111-111111111111', 'credit', 25000.00, 45750.00, 'Salary Deposit - November', 'Tech Corp LLC', 'salary', 'completed', 'SAL-2024-11', NOW() - INTERVAL '3 days'),
-- 'housing' → 'other' (housing not in enum)
('aaaa0001-0001-0001-0001-000000000002', 'aaaa1111-1111-1111-1111-111111111111', 'debit', 4500.00, 20750.00, 'Rent Payment', 'Emaar Properties', 'other', 'completed', 'RENT-NOV-24', NOW() - INTERVAL '5 days'),
('aaaa0001-0001-0001-0001-000000000003', 'aaaa1111-1111-1111-1111-111111111111', 'debit', 850.00, 25250.00, 'Grocery Shopping', 'Carrefour Mall of Emirates', 'groceries', 'completed', 'POS-8847362', NOW() - INTERVAL '2 days'),
('aaaa0001-0001-0001-0001-000000000004', 'aaaa1111-1111-1111-1111-111111111111', 'debit', 245.00, 26100.00, 'Restaurant Dinner', 'Zuma Dubai', 'restaurants', 'completed', 'POS-9923847', NOW() - INTERVAL '1 day'),
('aaaa0001-0001-0001-0001-000000000005', 'aaaa1111-1111-1111-1111-111111111111', 'debit', 129.00, 26345.00, 'Netflix Subscription', 'Netflix', 'entertainment', 'completed', 'SUB-NFLX-11', NOW() - INTERVAL '7 days'),
('aaaa0001-0001-0001-0001-000000000006', 'aaaa1111-1111-1111-1111-111111111111', 'debit', 350.00, 26474.00, 'Electricity Bill', 'DEWA', 'utilities', 'completed', 'DEWA-2024-11', NOW() - INTERVAL '10 days'),
('aaaa0001-0001-0001-0001-000000000007', 'aaaa1111-1111-1111-1111-111111111111', 'debit', 200.00, 26824.00, 'Mobile Bill', 'Etisalat', 'utilities', 'completed', 'ETIS-2024-11', NOW() - INTERVAL '8 days'),
('aaaa0001-0001-0001-0001-000000000008', 'aaaa1111-1111-1111-1111-111111111111', 'debit', 1500.00, 27024.00, 'Transfer to Savings', 'Internal Transfer', 'transfer', 'completed', 'INT-SAV-001', NOW() - INTERVAL '4 days'),
('aaaa0001-0001-0001-0001-000000000009', 'aaaa1111-1111-1111-1111-111111111111', 'debit', 89.00, 28524.00, 'Uber Rides', 'Uber', 'transport', 'completed', 'UBER-48372', NOW() - INTERVAL '1 day'),
('aaaa0001-0001-0001-0001-000000000010', 'aaaa1111-1111-1111-1111-111111111111', 'debit', 2100.00, 28613.00, 'Amazon Purchase', 'Amazon.ae', 'shopping', 'completed', 'AMZ-92837465', NOW() - INTERVAL '6 days'),

-- Mohammed Ali's transactions (Current Account)
('aaaa0002-0001-0001-0001-000000000001', 'aaaa2222-1111-1111-1111-111111111111', 'credit', 35000.00, 89500.00, 'Business Revenue', 'Ali Trading LLC', 'salary', 'completed', 'REV-2024-11', NOW() - INTERVAL '2 days'),
('aaaa0002-0001-0001-0001-000000000002', 'aaaa2222-1111-1111-1111-111111111111', 'debit', 8500.00, 54500.00, 'Office Rent', 'Dubai Properties', 'other', 'completed', 'OFF-RENT-11', NOW() - INTERVAL '5 days'),
('aaaa0002-0001-0001-0001-000000000003', 'aaaa2222-1111-1111-1111-111111111111', 'debit', 2500.00, 63000.00, 'Supplier Payment', 'Gulf Supplies Co', 'other', 'completed', 'SUP-PAY-847', NOW() - INTERVAL '3 days'),
('aaaa0002-0001-0001-0001-000000000004', 'aaaa2222-1111-1111-1111-111111111111', 'debit', 450.00, 65500.00, 'Business Dinner', 'Nobu Dubai', 'restaurants', 'completed', 'POS-7736254', NOW() - INTERVAL '4 days'),
('aaaa0002-0001-0001-0001-000000000005', 'aaaa2222-1111-1111-1111-111111111111', 'debit', 1200.00, 65950.00, 'Flight Tickets', 'Emirates Airlines', 'travel', 'completed', 'EK-847362', NOW() - INTERVAL '1 day'),

-- Emma Wilson's transactions
('aaaa0003-0001-0001-0001-000000000001', 'aaaa3333-1111-1111-1111-111111111111', 'credit', 12000.00, 12350.00, 'Salary', 'Marketing Agency', 'salary', 'completed', 'SAL-EW-11', NOW() - INTERVAL '3 days'),
-- 'housing' → 'other' (housing not in enum)
('aaaa0003-0001-0001-0001-000000000002', 'aaaa3333-1111-1111-1111-111111111111', 'debit', 3200.00, 350.00, 'Rent Share', 'Roommate Transfer', 'other', 'completed', 'RENT-SHARE', NOW() - INTERVAL '5 days'),
('aaaa0003-0001-0001-0001-000000000003', 'aaaa3333-1111-1111-1111-111111111111', 'debit', 280.00, 3550.00, 'Gym Membership', 'Fitness First', 'healthcare', 'completed', 'GYM-NOV-24', NOW() - INTERVAL '10 days'),
('aaaa0003-0001-0001-0001-000000000004', 'aaaa3333-1111-1111-1111-111111111111', 'debit', 156.00, 3830.00, 'Groceries', 'Spinneys', 'groceries', 'completed', 'POS-5567823', NOW() - INTERVAL '2 days'),
('aaaa0003-0001-0001-0001-000000000005', 'aaaa3333-1111-1111-1111-111111111111', 'debit', 89.00, 3986.00, 'Coffee & Snacks', 'Starbucks', 'restaurants', 'completed', 'POS-2234567', NOW() - INTERVAL '1 day'),

-- Raj Patel's transactions (Private Banking)
('aaaa0004-0001-0001-0001-000000000001', 'aaaa4444-1111-1111-1111-111111111111', 'credit', 150000.00, 567000.00, 'Investment Return', 'Private Wealth Fund', 'salary', 'completed', 'INV-RET-Q4', NOW() - INTERVAL '5 days'),
('aaaa0004-0001-0001-0001-000000000002', 'aaaa4444-1111-1111-1111-111111111111', 'debit', 50000.00, 417000.00, 'Property Investment', 'Dubai Land Dept', 'investment', 'completed', 'PROP-INV-24', NOW() - INTERVAL '10 days'),
('aaaa0004-0001-0001-0001-000000000003', 'aaaa4444-1111-1111-1111-111111111111', 'debit', 12000.00, 467000.00, 'Luxury Watch', 'Rolex Dubai Mall', 'shopping', 'completed', 'POS-ROLEX-1', NOW() - INTERVAL '3 days'),
('aaaa0004-0001-0001-0001-000000000004', 'aaaa4444-1111-1111-1111-111111111111', 'debit', 8500.00, 479000.00, 'Private Jet Charter', 'Jetex Dubai', 'travel', 'completed', 'JET-2024-11', NOW() - INTERVAL '7 days'),
('aaaa0004-0001-0001-0001-000000000005', 'aaaa4444-1111-1111-1111-111111111111', 'debit', 3500.00, 487500.00, 'Fine Dining', 'Ossiano Atlantis', 'restaurants', 'completed', 'POS-OSS-847', NOW() - INTERVAL '2 days'),

-- Fatima Hassan's transactions
('aaaa0005-0001-0001-0001-000000000001', 'aaaa5555-1111-1111-1111-111111111111', 'credit', 18000.00, 28900.00, 'Salary', 'Healthcare Corp', 'salary', 'completed', 'SAL-FH-11', NOW() - INTERVAL '3 days'),
-- 'housing' → 'other' (housing not in enum)
('aaaa0005-0001-0001-0001-000000000002', 'aaaa5555-1111-1111-1111-111111111111', 'debit', 5000.00, 10900.00, 'Rent', 'Al Wasl Properties', 'other', 'completed', 'RENT-FH-11', NOW() - INTERVAL '5 days'),
('aaaa0005-0001-0001-0001-000000000003', 'aaaa5555-1111-1111-1111-111111111111', 'debit', 750.00, 15900.00, 'Online Shopping', 'Noon.com', 'shopping', 'completed', 'NOON-847263', NOW() - INTERVAL '2 days'),
('aaaa0005-0001-0001-0001-000000000004', 'aaaa5555-1111-1111-1111-111111111111', 'debit', 350.00, 16650.00, 'Utilities', 'DEWA', 'utilities', 'completed', 'DEWA-FH-11', NOW() - INTERVAL '8 days'),
('aaaa0005-0001-0001-0001-000000000005', 'aaaa5555-1111-1111-1111-111111111111', 'debit', 1500.00, 17000.00, 'Transfer to Savings', 'Internal', 'transfer', 'completed', 'INT-SAV-FH', NOW() - INTERVAL '4 days')

ON CONFLICT (id) DO NOTHING;
