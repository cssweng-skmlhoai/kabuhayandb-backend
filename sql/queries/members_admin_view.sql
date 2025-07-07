SELECT
    CONCAT(m.first_name, ' ', m.middle_name, ' ', m.last_name) AS full_name,
    h.tct_no,
    h.block_no,
    h.lot_no,
    f.head_position
FROM
    kabuhayan_db.members m
JOIN
    kabuhayan_db.families f ON m.family_id = f.id
JOIN
    kabuhayan_db.households h ON f.household_id = h.id
ORDER BY
    m.id;