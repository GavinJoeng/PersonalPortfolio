import sqlite3
from threading import Lock
import os

# Get the directory of the current script
current_dir = os.path.dirname(os.path.abspath(__file__))

# Configure the SQLite database file using a relative path
dbconfig = {
    "database": os.path.join(current_dir, "../personal_portfolio.db")
}
# Simulated connection pool
class sqlite_connection_pool:
    def __init__(self, database, pool_size=5):
        self.database = database
        self.pool_size = pool_size
        self.connections = []
        self.lock = Lock()

    def get_connection(self):
        """
        Get a connection from the pool, or create a new one if the pool is empty.
        """
        with self.lock:
            if self.connections:
                # Reuse an existing connection
                return self.connections.pop()
            else:
                # Create a new connection
                try:
                    connection = sqlite3.connect(self.database)
                    # Optional: Set row factory for dictionary-like result
                    connection.row_factory = sqlite3.Row
                    print(f"New SQLite connection created to database: {self.database}")
                    return connection
                except sqlite3.Error as e:
                    print(f"Failed to create SQLite connection: {e}")
                    raise

    def return_connection(self, connection):
        with self.lock:
            try:
                # Validate connection before returning to the pool
                cursor = connection.cursor()
                cursor.execute("SELECT 1;")
                cursor.close()
                if len(self.connections) < self.pool_size:
                    self.connections.append(connection)
                else:
                    connection.close()
            except sqlite3.Error as e:
                print(f"Invalid connection discarded: {e}")
                connection.close()

# Create an SQLite connection pool
connection_pool = sqlite_connection_pool(
    database=dbconfig["database"],
    pool_size=5  # Maximum number of connections in the pool
)

def get_db_connection():
    """
    Get a connection from the connection pool.
    """
    try:
        connection = connection_pool.get_connection()
        print("Successfully obtained a database connection")
        return connection
    except sqlite3.Error as e:
        print(f"Failed to obtain connection: {e}")
        raise



GET_INDEX_INFO_QUERY = """
       SELECT 
       id AS user_id,
       welcome_text AS user_welcome_text,
       introduction AS user_introduction
       FROM users
       WHERE 
       username = ?
       AND status = 1
   """
# Example usage
if __name__ == "__main__":
    # Test obtaining a connection from the pool
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()

            # Query data from the `users` table using the correct query
            cursor.execute(GET_INDEX_INFO_QUERY, ('gavinjoeng',))
            rows = cursor.fetchall()  # Fetch all data

            if rows:
                print("User information:")
                for row in rows:
                    print(f"User ID: {row['user_id']}")
                    print(f"Welcome Text: {row['user_welcome_text']}")
                    print(f"Introduction: {row['user_introduction']}")
            else:
                print("No data found for the specified username.")
        except sqlite3.Error as e:
            print(f"Error occurred during query: {e}")
        finally:
            # Return the connection to the connection pool
            connection_pool.return_connection(conn)
            print("Connection returned to the pool")
