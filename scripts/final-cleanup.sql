
UPDATE restaurant_tables SET status = 'AVAILABLE', "currentOrderId" = NULL, "isReserved" = FALSE, "reservedUntil" = NULL, "mergedWithId" = NULL;
UPDATE inventory SET quantity = 100;
