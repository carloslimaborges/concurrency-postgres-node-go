# Concurrency Demo with Robust and Naive Services

## Overview

This repository demonstrates concurrency handling in a simple banking system and how different approaches affect data integrity under load.

You have:

1. **robust-service/**:  
   A Node.js REST service that uses PostgreSQL transactions and `SELECT ... FOR UPDATE` to ensure data consistency under concurrent operations.

2. **naive-service/**:  
   A Node.js REST service that does not use proper concurrency control, prone to race conditions and inconsistent final balances under load.

3. **Load Testing Clients**:
   - **Go (load-tester/)**: A Go-based client that performs a deterministic set of deposit and withdraw operations, then checks final balances against expected results.
   - **k6 (k6-load-test/)**: A JavaScript-based load testing tool.
   - **Locust (locust-load-test/)**: A Python-based load testing tool.

These tools can be used to compare the behaviors of the robust and naive services.

## What You’ll Learn

- How transactions and locks prevent concurrency issues (robust-service).
- How ignoring concurrency control can lead to incorrect balances (naive-service).
- How to run deterministic tests that verify final results against expected outcomes.
- How to use various load testing tools (Go, k6, Locust) and how to integrate them via Docker.

## Prerequisites

- **Docker & Docker Compose**: To run PostgreSQL and Node.js services.
- **Go, k6, Locust** (optional): If you want to use those particular load testers. Otherwise, just use one method you’re comfortable with.
- **Node.js**: If you wish to run services locally outside of Docker (optional).

## Running the Robust Service

1. Navigate to `robust-service`:
   ```bash
   cd robust-service
   docker-compose up --build
   ```
   This starts a Postgres DB and the robust Node.js service at `http://localhost:3000`.

2. Test endpoints:
   ```bash
   curl -X POST http://localhost:3000/reset
   curl http://localhost:3000/balance/1
   ```
   Expected initial balance: 1000.

## Running the Naive Service

1. Navigate to `naive-service`:
   ```bash
   cd naive-service
   docker-compose up --build
   ```
   This starts a Postgres DB and the naive Node.js service at `http://localhost:3000`.

2. Test similarly:
   ```bash
   curl -X POST http://localhost:3000/reset
   curl http://localhost:3000/balance/1
   ```

## Deterministic Load Test with Go

The `load-tester` script runs a known sequence of operations and checks the final balances against expected values, printing “SUCCESS” or “FAIL”.

Users and operations:

- User 1: 100 deposits of 10 (+1000), 100 withdrawals of 5 (-500), expected final = 1500
- User 2: 50 deposits of 20 (+1000), 50 withdrawals of 15 (-750), expected final = 1250
- User 3: 200 deposits of 1 (+200), 100 withdrawals of 2 (-200), expected final = 1000

### Running Locally

Make sure your service is running (e.g., the robust-service):

```bash
cd load-tester
go mod tidy
go run main.go
```

If using robust-service, expect “SUCCESS”. With naive-service, often you’ll get “FAIL” due to concurrency issues.

### Running Go Tester in Docker

In `load-tester`:
```bash
docker-compose up --build
```
This will try `http://host.docker.internal:3000`. Adjust if needed.

## Using k6

1. Start the robust or naive service.
2. In `k6-load-test`, run:
   ```bash
   k6 run script.js
   ```
   or dockerized:
   ```bash
   docker build -t k6-test k6-load-test
   docker run --network="host" k6-test
   ```
3. After k6 finishes, run:
   ```bash
   curl http://localhost:3000/balance/1
   ```
   Check if the final balance matches your expected result (in a deterministic scenario, you’d adjust the script to mimic the known operations).

## Using Locust

1. Start a service.
2. In `locust-load-test`:
   ```bash
   docker-compose up --build
   ```
3. Access `http://localhost:8089` to configure and start tests.
4. After tests, use `curl http://localhost:3000/balance/1` to verify final balances.

If you want deterministic tests with Locust, you can adjust `locustfile.py` to perform the exact known operations (similar to the Go tester).

## Debugging in PostgreSQL

Connect to Postgres:
```bash
docker-compose exec db psql -U bankuser -d bankdb
```

Check tables:
```sql
SELECT * FROM accounts;
```

Check locks and activity:
```sql
SELECT * FROM pg_stat_activity;
SELECT * FROM pg_locks;
```

This helps you understand lock contention and concurrency behavior.

## Conclusion

This setup provides a comprehensive environment to:

- Compare a robust vs. naive concurrency handling strategy.
- Run deterministic load tests to confirm success or failure.
- Experiment with various load testing tools.
- Debug concurrency issues at the database level.

Use the deterministic approach (as shown in `main.go` of the load-tester) to confidently assert whether the system behaves as expected.