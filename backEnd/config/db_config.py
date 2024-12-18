import mysql.connector
from mysql.connector import pooling

# 配置連接池
dbconfig = {
    "host": "localhost",       # 修改為你的 MySQL 主機
    "user": "root",            # 修改為你的 MySQL 用戶名
    "password": "GavinJoeng",  # 修改為你的密碼
    "database": "personal_portfolio"  # 修改為你的數據庫名
}

# 創建連接池
connection_pool = pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=5,       # 池中的最大連接數
    **dbconfig
)

def get_db_connection():
    """
    從連接池中獲取一個連接。
    """
    try:
        connection = connection_pool.get_connection()
        print("成功獲取數據庫連接")
        return connection
    except mysql.connector.Error as e:
        print(f"獲取連接失敗: {e}")
        return None

# 示例用法
if __name__ == "__main__":
    # 測試獲取連接
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT DATABASE();")  # 測試查詢當前數據庫
            result = cursor.fetchone()
            print(f"當前數據庫: {result[0]}")
        finally:
            cursor.close()
            conn.close()  # 記得關閉連接，返回給連接池
            print("連接已返回連接池")
