# Order workflows

Custom: new_inquiry → under_review → quotation_sent → awaiting_advance → payment_verification → confirmed → ingredients_required → in_preparation → ready → rider_assigned → out_for_delivery → delivered → completed. Pickup may go from ready to delivered. Confirmation requires verified advances or an explicit audited admin override. Rejected/expired quotations never create bookings. Revision invalidates older open quotations. Acceptance creates exactly one order. Status history is append-only through controlled functions.

Ready checkout locks product rows and reserves available stock within one transaction. Prices come from the database. Payment proof is evidence, never automatic verification. Cancellation restores ready stock once. Refunds require manual financial reconciliation.

Inventory purchases lock ingredients, update weighted average cost and stock, and create movements in the same transaction. Capacity warns without rejecting inquiries. Customer token pages never expose internal notes.
