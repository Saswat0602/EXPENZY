# Database Connection Pooling Configuration

## Overview
Connection pooling improves database performance by reusing existing connections instead of creating new ones for each request.

## Configuration

### Option 1: Environment Variable (Recommended)
Add connection pooling parameters to your `DATABASE_URL`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/expense_tracker?connection_limit=10&pool_timeout=20&connect_timeout=10"
```

### Parameters Explained:
- `connection_limit=10` - Maximum number of connections in the pool
- `pool_timeout=20` - Timeout (seconds) for acquiring a connection from the pool
- `connect_timeout=10` - Timeout (seconds) for establishing initial connection
- `socket_timeout=30` - Timeout (seconds) for socket operations

### Option 2: Prisma Schema Configuration
Already configured in `prisma.service.ts` with:
- Query logging in development
- Error formatting
- Automatic connection/disconnection

## Recommended Settings by Environment

### Development
```
connection_limit=5
pool_timeout=20
```

### Production
```
connection_limit=20
pool_timeout=30
connect_timeout=15
```

### High Traffic Production
```
connection_limit=50
pool_timeout=60
connect_timeout=20
```

## Monitoring
Check logs for:
- `✅ Database connected successfully` - Connection established
- `📊 Connection pooling enabled` - Pool is active (dev mode)
- `🔌 Database disconnected` - Clean shutdown

## Performance Tips
1. **Right-size your pool**: Too many connections waste resources, too few cause bottlenecks
2. **Monitor slow queries**: Check logs for queries > 1000ms
3. **Use indexes**: Ensure all foreign keys and frequently queried fields are indexed
4. **Connection reuse**: Prisma automatically handles connection pooling

## Troubleshooting

### "Too many connections" error
- Reduce `connection_limit`
- Check for connection leaks
- Ensure proper cleanup in services

### Slow query performance
- Check database indexes
- Review N+1 query patterns
- Use `include` strategically
- Consider pagination for large datasets
