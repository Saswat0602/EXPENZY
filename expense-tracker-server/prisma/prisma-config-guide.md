datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Connection pooling configuration
  // Optimizes database connections for better performance
  // pgbouncer mode: Use 'transaction' for connection pooling
  // directUrl is used for migrations
}

// Connection Pool Settings (configure in DATABASE_URL):
// ?connection_limit=10          - Maximum number of connections
// &pool_timeout=20              - Timeout for acquiring connection (seconds)
// &connect_timeout=10           - Timeout for establishing connection (seconds)
// &socket_timeout=30            - Timeout for socket operations (seconds)

// Example DATABASE_URL with pooling:
// postgresql://user:password@localhost:5432/dbname?connection_limit=10&pool_timeout=20

generator client {
  provider = "prisma-client-js"
  // Enable query logging in development
  log      = ["query", "info", "warn", "error"]
}
