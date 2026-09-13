#!/usr/bin/env bash
set -euo pipefail
container="creamy-db-test-$$"
docker run --name "$container" -e POSTGRES_PASSWORD=isolated-test-only -e POSTGRES_DB=creamy_test -d postgres:17-alpine >/dev/null
trap 'docker rm -f "$container" >/dev/null' EXIT
for attempt in $(seq 1 30); do
  if docker exec "$container" pg_isready -U postgres >/dev/null 2>&1; then break; fi
  sleep 1
done
for file in tests/db/bootstrap.sql supabase/migrations/*.sql supabase/seed.sql tests/db/workflows.sql; do
  echo "Applying $file"
  docker exec -i "$container" psql -U postgres -d creamy_test -v ON_ERROR_STOP=1 < "$file"
done
