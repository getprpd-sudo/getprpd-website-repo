# Payment Reconciliation Standard

The live `Payment Log` is the payment source of truth. An order receipt confirms that an order was recorded; it does not prove payment.

## Evidence workflow

1. Search the connected Gmail inbox for new payment notifications delivered to the PRPD payment address.
2. Match the notification to an open Payment Log row.
3. The strongest automatic match is the exact Order ID plus the exact rounded amount due.
4. If the notice omits the Order ID, require a unique current unpaid order matching both the sender identity and exact amount. Record that the notice omitted the reference.
5. If multiple orders could match, the amount differs, the message says pending or blocked, or the sender identity is unclear, leave the balance open and mark it for owner review.
6. Only after a verified match, fill Paid Date, Amount Paid, Balance, Method, Notes, Payment Evidence, Evidence Match, Verified At, and Verified By.
7. Never infer payment from a customer text, an order receipt, a screenshot without transaction context, or a generic bank alert.

The four evidence columns in `Payment Log` are an audit trail. Do not place bank-account numbers, private transaction identifiers, email message IDs, or other banking details in them.

## Phone-number handling

Customer checkout requires a complete ten-digit contact number. Numbers that do not resemble a standard North American numbering-plan assignment are accepted so a legitimate customer is not blocked, but the website asks the customer to double-check and the operator brief flags the number for confirmation before delivery.
