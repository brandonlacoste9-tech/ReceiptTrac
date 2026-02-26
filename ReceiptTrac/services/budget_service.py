"""
Budget Tracking & Analytics Service
Track spending against budgets, generate insights
"""
import sqlite3
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class Budget:
    category: str
    amount: float
    period: str  # weekly, monthly, yearly
    alert_threshold: float = 0.8  # Alert at 80% spent

class BudgetService:
    """Manage budgets and track spending against them"""
    
    def __init__(self, db_path: str = "receipttrac.db"):
        self.db_path = db_path
        self.init_budget_tables()
    
    def init_budget_tables(self):
        """Create budget tables"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Budgets table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS budgets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    category TEXT NOT NULL,
                    amount REAL NOT NULL,
                    period TEXT DEFAULT 'monthly',
                    alert_threshold REAL DEFAULT 0.8,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(category, period)
                )
            """)
            
            # Recurring expenses
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS recurring_expenses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    merchant TEXT NOT NULL,
                    amount REAL NOT NULL,
                    category TEXT,
                    frequency TEXT,  -- weekly, monthly, yearly
                    day_of_month INTEGER,
                    active BOOLEAN DEFAULT 1,
                    last_processed DATE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Savings goals
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS savings_goals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    target_amount REAL NOT NULL,
                    current_amount REAL DEFAULT 0,
                    deadline DATE,
                    category TEXT,
                    active BOOLEAN DEFAULT 1
                )
            """)
            
            conn.commit()
    
    def set_budget(self, category: str, amount: float, 
                   period: str = "monthly", alert_threshold: float = 0.8) -> bool:
        """Set or update budget for a category"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO budgets (category, amount, period, alert_threshold)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(category, period) DO UPDATE SET
                    amount = excluded.amount,
                    alert_threshold = excluded.alert_threshold
            """, (category, amount, period, alert_threshold))
            conn.commit()
            return True
    
    def get_budget_status(self, category: str = None, 
                          period: str = "monthly") -> List[Dict]:
        """Get budget vs actual spending"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Get all budgets
            if category:
                cursor.execute("""
                    SELECT * FROM budgets WHERE category = ? AND period = ?
                """, (category, period))
            else:
                cursor.execute("""
                    SELECT * FROM budgets WHERE period = ?
                """, (period,))
            
            budgets = cursor.fetchall()
            
            # Calculate period date range
            today = datetime.now()
            if period == "weekly":
                start_date = today - timedelta(days=today.weekday())
            elif period == "monthly":
                start_date = today.replace(day=1)
            elif period == "yearly":
                start_date = today.replace(month=1, day=1)
            else:
                start_date = today - timedelta(days=30)
            
            results = []
            for budget in dict(budgets):
                # Get actual spending
                cursor.execute("""
                    SELECT SUM(total) as spent, COUNT(*) as transactions
                    FROM receipts
                    WHERE category = ? AND date >= ?
                """, (budget["category"], start_date.strftime("%Y-%m-%d")))
                
                spending = cursor.fetchone()
                spent = spending["spent"] or 0
                
                remaining = budget["amount"] - spent
                percent_used = spent / budget["amount"] if budget["amount"] > 0 else 0
                
                results.append({
                    "category": budget["category"],
                    "budget_amount": budget["amount"],
                    "spent": spent,
                    "remaining": remaining,
                    "percent_used": round(percent_used * 100, 1),
                    "transactions": spending["transactions"],
                    "alert": percent_used >= budget["alert_threshold"],
                    "over_budget": spent > budget["amount"]
                })
            
            return results
    
    def add_recurring_expense(self, merchant: str, amount: float,
                              category: str, frequency: str = "monthly",
                              day_of_month: int = 1) -> int:
        """Add a recurring expense (subscriptions, bills)"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO recurring_expenses 
                (merchant, amount, category, frequency, day_of_month)
                VALUES (?, ?, ?, ?, ?)
            """, (merchant, amount, category, frequency, day_of_month))
            conn.commit()
            return cursor.lastrowid
    
    def get_recurring_expenses(self) -> List[Dict]:
        """Get all recurring expenses with annual total"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM recurring_expenses WHERE active = 1")
            expenses = [dict(row) for row in cursor.fetchall()]
            
            # Calculate annual cost
            for exp in expenses:
                if exp["frequency"] == "weekly":
                    exp["annual_cost"] = exp["amount"] * 52
                elif exp["frequency"] == "monthly":
                    exp["annual_cost"] = exp["amount"] * 12
                elif exp["frequency"] == "yearly":
                    exp["annual_cost"] = exp["amount"]
                else:
                    exp["annual_cost"] = exp["amount"] * 12
            
            return expenses
    
    def add_savings_goal(self, name: str, target_amount: float,
                        deadline: str = None, category: str = None) -> int:
        """Add a savings goal"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO savings_goals (name, target_amount, deadline, category)
                VALUES (?, ?, ?, ?)
            """, (name, target_amount, deadline, category))
            conn.commit()
            return cursor.lastrowid
    
    def get_spending_insights(self, months: int = 3) -> Dict:
        """Generate AI-style spending insights"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30 * months)
            
            # Get spending trends
            cursor.execute("""
                SELECT 
                    strftime('%Y-%m', date) as month,
                    category,
                    SUM(total) as total,
                    COUNT(*) as count
                FROM receipts
                WHERE date >= ?
                GROUP BY month, category
                ORDER BY month DESC
            """, (start_date.strftime("%Y-%m-%d"),))
            
            trends = {}
            for row in cursor.fetchall():
                month = row["month"]
                if month not in trends:
                    trends[month] = {}
                trends[month][row["category"]] = {
                    "total": row["total"],
                    "count": row["count"]
                }
            
            # Top merchants
            cursor.execute("""
                SELECT merchant, SUM(total) as total, COUNT(*) as visits
                FROM receipts
                WHERE date >= ?
                GROUP BY merchant
                ORDER BY total DESC
                LIMIT 5
            """, (start_date.strftime("%Y-%m-%d"),))
            
            top_merchants = [dict(row) for row in cursor.fetchall()]
            
            # Average daily spending
            cursor.execute("""
                SELECT AVG(daily_total) as avg_daily
                FROM (
                    SELECT date, SUM(total) as daily_total
                    FROM receipts
                    WHERE date >= ?
                    GROUP BY date
                )
            """, (start_date.strftime("%Y-%m-%d"),))
            
            avg_daily = cursor.fetchone()["avg_daily"] or 0
            
            # Generate insights
            insights = []
            
            # Check for overspending categories
            budget_status = self.get_budget_status()
            for status in budget_status:
                if status["over_budget"]:
                    insights.append({
                        "type": "warning",
                        "message": f"Over budget in {status['category']}: ${status['spent']:.2f} / ${status['budget_amount']:.2f}"
                    })
                elif status["alert"]:
                    insights.append({
                        "type": "caution",
                        "message": f"Approaching budget limit in {status['category']}: {status['percent_used']:.0f}% used"
                    })
            
            # Check recurring expenses
            recurring = self.get_recurring_expenses()
            annual_recurring = sum(r["annual_cost"] for r in recurring)
            if annual_recurring > 0:
                insights.append({
                    "type": "info",
                    "message": f"You have ${annual_recurring:.2f}/year in recurring expenses ({len(recurring)} subscriptions/bills)"
                })
            
            return {
                "period_months": months,
                "total_spent": sum(sum(m.values()) for m in trends.values()),
                "average_daily": round(avg_daily, 2),
                "trends": trends,
                "top_merchants": top_merchants,
                "recurring_annual": annual_recurring,
                "insights": insights,
                "budget_status": budget_status
            }
