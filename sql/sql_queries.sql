-- ================================================
-- PROJECT: E-COMMERCE SALES DASHBOARD ANALYSIS
-- DATABASE: sales.db
-- ================================================

-- 1️⃣ View the structure of the table
PRAGMA table_info(sales);

-- 2️⃣ Top 10 selling categories by total revenue
SELECT Category, SUM(Total_Amount) AS total_revenue
FROM sales
GROUP BY Category
ORDER BY total_revenue DESC
LIMIT 10;

-- 3️⃣ Monthly revenue trend
SELECT strftime('%Y-%m', Date) AS Month, SUM(Total_Amount) AS Revenue
FROM sales
GROUP BY Month
ORDER BY Month;

-- 4️⃣ Average order value
SELECT ROUND(AVG(Total_Amount), 2) AS avg_order_value
FROM sales;

-- 5️⃣ State-wise total revenue
SELECT [ship-state] AS State, SUM(Total_Amount) AS TotalRevenue
FROM sales
GROUP BY [ship-state]
ORDER BY TotalRevenue DESC;

-- 6️⃣ Number of orders by fulfillment type
SELECT Fulfilment, COUNT(*) AS total_orders
FROM sales
GROUP BY Fulfilment;

-- 7️⃣ Total quantity sold per category
SELECT Category, SUM(Qty) AS total_quantity
FROM sales
GROUP BY Category
ORDER BY total_quantity DESC;

-- 8️⃣ Monthly average revenue per order
SELECT strftime('%Y-%m', Date) AS Month,
       ROUND(SUM(Total_Amount)/COUNT(Order_ID), 2) AS avg_revenue_per_order
FROM sales
GROUP BY Month
ORDER BY Month;

-- 9️⃣ Highest revenue day
SELECT Date, SUM(Total_Amount) AS Daily_Revenue
FROM sales
GROUP BY Date
ORDER BY Daily_Revenue DESC
LIMIT 1;

-- 🔟 Percentage contribution of each category to total revenue
SELECT Category,
       ROUND(100.0 * SUM(Total_Amount) / (SELECT SUM(Total_Amount) FROM sales), 2) AS Revenue_Percentage
FROM sales
GROUP BY Category
ORDER BY Revenue_Percentage DESC;
