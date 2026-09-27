-- Total revenue

SELECT
    COALESCE(SUM(final_price), 0) AS total_revenue
FROM registrations
WHERE status IN (
    'confirmed',
    'medical_non_compliant'
);