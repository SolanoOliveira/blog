#!/usr/bin/env bash
set -euo pipefail
: "${BLOG_ADMIN_PASSWORD:?Defina BLOG_ADMIN_PASSWORD nas variáveis privadas do ambiente (mínimo 12 caracteres)}"
project_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$project_dir/backend"
exec /workspace/jdk-21.0.8+9/bin/java -jar target/blog-0.0.1-SNAPSHOT.jar
