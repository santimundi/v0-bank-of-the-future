-- Seed AI conversations and messages

-- Updated to use only the 5 conversation IDs that exist in the database
INSERT INTO ai_conversations (id, user_id, title, scope, is_pinned) VALUES
('f1111111-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'Balance inquiry', ARRAY['my_accounts'], true),
('f2222222-0001-0001-0001-000000000001', '22222222-2222-2222-2222-222222222222', 'Savings Goal Strategy', ARRAY['savings'], false),
('f3333333-0001-0001-0001-000000000001', '33333333-3333-3333-3333-333333333333', 'Investment Diversification', ARRAY['accounts', 'transactions'], true),
('f4444444-0001-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'Debt Repayment Plan', ARRAY['loans'], false),
('f5555555-0001-0001-0001-000000000001', '55555555-5555-5555-5555-555555555555', 'Business Cash Flow Analysis', ARRAY['accounts', 'transactions'], true)
ON CONFLICT (id) DO NOTHING;

-- Seed AI messages
-- Updated all conversation_id references to use existing IDs only
INSERT INTO ai_messages (id, conversation_id, role, content, citations, confidence, data_used, actions, requires_escalation, pii_masked) VALUES
-- Conversation 1: Balance inquiry (User 1)
('abcd0001-0001-0001-0001-000000000001', 'f1111111-0001-0001-0001-000000000001', 'user', 
  'What is my current balance?', NULL, NULL, NULL, NULL, false, false),
('abcd0001-0002-0001-0001-000000000002', 'f1111111-0001-0001-0001-000000000001', 'assistant', 
  'Your total balance across all accounts is AED 175,950.00. Here''s the breakdown:\n\n• Primary Current Account: AED 45,750.00\n• High Yield Savings: AED 125,000.00\n• USD Travel Wallet: $5,200.00 (≈AED 19,100)\n\nYour available balance (excluding pending transactions) is AED 175,450.00.',
  '[{"source": "Account Balances", "type": "account", "excerpt": "Real-time balance as of Nov 26, 2024"}]',
  'high', ARRAY['accounts', 'balances'], NULL, false, false),
('abcd0001-0003-0001-0001-000000000003', 'f1111111-0001-0001-0001-000000000001', 'user', 
  'How much did I spend on restaurants this month?', NULL, NULL, NULL, NULL, false, false),
('abcd0001-0004-0001-0001-000000000004', 'f1111111-0001-0001-0001-000000000001', 'assistant', 
  'This month you''ve spent AED 1,245.00 on dining, which is 23% higher than your monthly average of AED 1,012.00.\n\nTop restaurants:\n• Zuma Dubai: AED 245.00\n• Nobu Dubai: AED 450.00\n• Various cafes: AED 550.00\n\nWould you like me to set up a dining budget alert?',
  '[{"source": "Transaction Analysis", "type": "account", "excerpt": "November 2024 dining category"}]',
  'high', ARRAY['transactions', 'spending_analysis'], 
  '[{"label": "Set Budget Alert", "type": "budget_alert", "params": {"category": "dining", "limit": 1000}}]',
  false, false),

-- Conversation 2: Savings Goal Strategy (User 2)
('abcd0002-0001-0001-0001-000000000001', 'f2222222-0001-0001-0001-000000000001', 'user', 
  'What''s the best way to save for a vacation?', NULL, NULL, NULL, NULL, false, false),
('abcd0002-0002-0001-0001-000000000002', 'f2222222-0001-0001-0001-000000000001', 'assistant', 
  'Great question! Here are my recommendations for saving for your vacation:\n\n1. **Set a specific goal**: Where do you want to go and how much will it cost?\n2. **Create a dedicated savings goal**: I can help you set this up in the app\n3. **Automate your savings**: Set up monthly auto-transfers\n4. **Track your progress**: The app will show your progress toward your goal\n\nHow much are you planning to spend on your vacation and when do you want to travel?',
  '[{"source": "Savings Tips", "type": "product", "excerpt": "Vacation savings strategies"}]',
  'high', ARRAY['savings'], NULL, false, false),

-- Conversation 3: Investment Diversification (User 3)
('abcd0003-0001-0001-0001-000000000001', 'f3333333-0001-0001-0001-000000000001', 'user', 
  'Should I diversify my investment portfolio?', NULL, NULL, NULL, NULL, false, false),
('abcd0003-0002-0001-0001-000000000002', 'f3333333-0001-0001-0001-000000000001', 'assistant', 
  'Diversification is key to managing investment risk. Looking at your current portfolio:\n\n**Current Allocation:**\n- Tech Stocks: 65%\n- Government Bonds: 20%\n- Real Estate: 15%\n\n**Recommendation:**\nYour portfolio is heavily weighted in tech stocks. I''d suggest:\n- Reduce tech exposure to 40%\n- Add international stocks: 15%\n- Increase bonds to 25%\n- Add commodities: 5%\n- Keep real estate at 15%\n\nThis would give you better protection against market volatility while still maintaining growth potential.',
  '[{"source": "Portfolio Analysis", "type": "account", "excerpt": "Current holdings breakdown"}]',
  'medium', ARRAY['accounts', 'transactions'],
  '[{"label": "See Investment Options", "type": "navigate", "params": {"path": "/investments"}}]',
  false, false),

-- Conversation 4: Debt Repayment Plan (User 4)
('abcd0004-0001-0001-0001-000000000001', 'f4444444-0001-0001-0001-000000000001', 'user', 
  'I have a personal loan. What''s the fastest way to pay it off?', NULL, NULL, NULL, NULL, false, false),
('abcd0004-0002-0001-0001-000000000002', 'f4444444-0001-0001-0001-000000000001', 'assistant', 
  'I can see you have a personal loan with AED 18,000 remaining at 9.5% interest. Here are strategies to pay it off faster:\n\n**Option 1: Increase Monthly Payments**\nYour current payment: AED 850/month\nIf you pay AED 1,200/month, you''ll save AED 2,100 in interest and pay off 8 months earlier.\n\n**Option 2: Make Bi-Weekly Payments**\nPay AED 425 every two weeks instead of AED 850 monthly. This adds one extra payment per year.\n\n**Option 3: Lump Sum Payments**\nUse bonuses or tax refunds for extra payments.\n\nWould you like me to create a detailed repayment schedule?',
  '[{"source": "Loan Details", "type": "account", "excerpt": "Personal loan AED 18,000 at 9.5%"}, {"source": "Repayment Calculator", "type": "product"}]',
  'high', ARRAY['loans'],
  '[{"label": "View Repayment Options", "type": "navigate", "params": {"path": "/loans"}}]',
  false, true),

-- Conversation 5: Business Cash Flow (User 5)
('abcd0005-0001-0001-0001-000000000001', 'f5555555-0001-0001-0001-000000000001', 'user', 
  'Can you analyze my business cash flow for the last quarter?', NULL, NULL, NULL, NULL, false, false),
('abcd0005-0002-0001-0001-000000000002', 'f5555555-0001-0001-0001-000000000001', 'assistant', 
  'I''ve analyzed your business account transactions for Q3 2024:\n\n**Cash Flow Summary:**\n- Total Inflows: AED 485,000\n- Total Outflows: AED 412,000\n- Net Cash Flow: +AED 73,000\n\n**Key Insights:**\n1. **Revenue Growth**: 12% increase from Q2\n2. **Major Expenses**: Payroll (45%), Supplies (25%), Rent (15%)\n3. **Cash Reserve**: You have 2.3 months of operating expenses\n\n**Recommendations:**\n- Build cash reserve to 3-6 months of expenses\n- Consider negotiating better supplier terms\n- Review subscription services for potential savings\n\nWould you like a detailed breakdown by category?',
  '[{"source": "Business Account Analysis", "type": "account", "excerpt": "Q3 2024 transactions"}]',
  'high', ARRAY['accounts', 'transactions'], NULL, false, false)

ON CONFLICT (id) DO NOTHING;
